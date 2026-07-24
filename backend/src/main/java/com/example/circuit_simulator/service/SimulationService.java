package com.example.circuit_simulator.service;

import com.example.circuit_simulator.simulation.AnalysisModes;
import com.example.circuit_simulator.simulation.SimPhase;
import com.example.circuit_simulator.simulation.TranProbe;
import com.example.circuit_simulator.simulation.TranScenario;
import com.example.circuit_simulator.simulation.TranSpiceBuild;
import com.example.circuit_simulator.utils.SpiceGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SimulationService {

    private static final int MAX_TRAN_POINTS = 500;

    private final ObjectMapper objectMapper;

    /** TFB.L3.3: whether the pot off extreme is at wiper position 1.0 (per request). */
    private final ThreadLocal<Boolean> potOffAtHighEnd = new ThreadLocal<>();

    public void setPotOffAtHighEndForValidation(Boolean value) {
        if (value == null) {
            potOffAtHighEnd.remove();
        } else {
            potOffAtHighEnd.set(value);
        }
    }

    /**
     * TFB.L3.3: which track end is the latch-off extreme (0.0 vs 1.0 wiper position).
     */
    public boolean detectPotOffAtHighEnd(String circuitJson, String problemCode)
            throws Exception {
        String closed =
                SpiceGenerator.applySwitchStates(circuitJson, Map.of("switch", "closed"));
        String atLow = SpiceGenerator.applyPotPositions(
                closed, Map.of("variable_resistor", 0.0));
        String atHigh = SpiceGenerator.applyPotPositions(
                closed, Map.of("variable_resistor", 1.0));
        double iLow = readLampCurrentAbs(simulateHysteresisSettle(atLow, problemCode, 0.0, true));
        double iHigh = readLampCurrentAbs(simulateHysteresisSettle(atHigh, problemCode, 1.0, true));
        // Require a clear OFF vs ON contrast so a sticky latch (both ends lit)
        // does not flip the orientation map and break the off cases.
        boolean lowLit = iLow > 0.05;
        boolean highLit = iHigh > 0.05;
        boolean lowDark = iLow < 0.01;
        boolean highDark = iHigh < 0.01;
        if (lowLit && highDark) {
            return true;
        }
        if (highLit && lowDark) {
            return false;
        }
        return iLow > iHigh * 1.5 + 0.01;
    }

    private Map<String, Object> simulateHysteresisSettle(
            String circuitJson,
            String problemCode,
            double priorPot,
            boolean bootstrapOffPrior) throws Exception {
        return runPotHysteresisSettleToDcMap(
                circuitJson,
                Map.of("variable_resistor", priorPot),
                problemCode,
                bootstrapOffPrior);
    }

    private boolean resolvePotOffAtHighEnd(String circuitJson, String problemCode)
            throws Exception {
        Boolean cached = potOffAtHighEnd.get();
        if (cached != null) {
            return cached;
        }
        if (!AnalysisModes.usesPotHysteresis(problemCode)) {
            return false;
        }
        boolean detected = detectPotOffAtHighEnd(circuitJson, problemCode);
        potOffAtHighEnd.set(detected);
        return detected;
    }

    /**
     * Seed ICs from switch-open DC only when the target wiper is at the latch-off
     * extreme and the case does not supply a directed prior (prior equals target).
     */
    private boolean shouldBootstrapOffPrior(
            double priorPot, double targetPot, boolean offAtHigh) {
        boolean atOffExtreme =
                offAtHigh ? targetPot >= 1.0 - 1e-9 : targetPot <= 1e-9;
        boolean noDirectedPrior = Math.abs(priorPot - targetPot) < 1e-9;
        return atOffExtreme && noDirectedPrior;
    }

    @SuppressWarnings("unchecked")
    private static double readLampCurrentAbs(Map<String, Object> sim) {
        Map<String, Double> nodes = (Map<String, Double>) sim.getOrDefault("nodes", Map.of());
        for (Map.Entry<String, Double> entry : nodes.entrySet()) {
            String key = entry.getKey().toLowerCase();
            if (key.contains("lamp") && key.contains("[i]")) {
                return Math.abs(entry.getValue());
            }
        }
        Map<String, Object> components =
                (Map<String, Object>) sim.getOrDefault("components", Map.of());
        for (Map.Entry<String, Object> entry : components.entrySet()) {
            if (entry.getKey().toLowerCase().contains("lamp")
                    && entry.getValue() instanceof Number n) {
                return Math.abs(n.doubleValue());
            }
        }
        return 0.0;
    }

    public String simulate(String circuitJson) {
        return simulate(circuitJson, null);
    }

    public String simulate(String circuitJson, String problemCode) {
        return simulate(circuitJson, problemCode, null);
    }

    public String simulate(String circuitJson, String problemCode, String simPhase) {
        return simulate(circuitJson, problemCode, simPhase, null);
    }

    public String simulate(
            String circuitJson,
            String problemCode,
            String simPhase,
            Map<String, Double> priorPotPositions) {
        return simulate(circuitJson, problemCode, simPhase, priorPotPositions, null);
    }

    public String simulate(
            String circuitJson,
            String problemCode,
            String simPhase,
            Map<String, Double> priorPotPositions,
            Map<String, String> priorSwitchStates) {
        try {
            return objectMapper.writeValueAsString(
                    simulateToMap(
                            circuitJson,
                            problemCode,
                            simPhase,
                            priorPotPositions,
                            priorSwitchStates));
        } catch (Exception e) {
            return "{ \"error\": \"" + escapeJson(e.getMessage()) + "\" }";
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> simulateToMap(String circuitJson) throws Exception {
        return simulateToMap(circuitJson, null, null, null, null);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> simulateToMap(String circuitJson, String problemCode)
            throws Exception {
        return simulateToMap(circuitJson, problemCode, null, null, null);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> simulateToMap(
            String circuitJson, String problemCode, String simPhaseName) throws Exception {
        return simulateToMap(circuitJson, problemCode, simPhaseName, null, null);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> simulateToMap(
            String circuitJson,
            String problemCode,
            String simPhaseName,
            Map<String, Double> priorPotPositions) throws Exception {
        return simulateToMap(circuitJson, problemCode, simPhaseName, priorPotPositions, null);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> simulateToMap(
            String circuitJson,
            String problemCode,
            String simPhaseName,
            Map<String, Double> priorPotPositions,
            Map<String, String> priorSwitchStates) throws Exception {
        try {
            circuitJson = SpiceGenerator.normalizeSeriesSupplyPolarity(circuitJson);
            SpiceGenerator.assertSimulatableSupplies(circuitJson);
            if (AnalysisModes.usesButtonLatchSettle(problemCode)
                    && priorSwitchStates != null
                    && !priorSwitchStates.isEmpty()) {
                Map<String, Object> settled = runButtonLatchSettleToDcMap(
                        circuitJson, priorSwitchStates, problemCode);
                if (!settled.containsKey("error")) {
                    return settled;
                }
            }
            if (AnalysisModes.usesPotHysteresis(problemCode)
                    && !isMasterSwitchOpen(circuitJson)) {
                double targetPot =
                        SpiceGenerator.readPotPosition(circuitJson, "variable_resistor");
                boolean offAtHigh = resolvePotOffAtHighEnd(circuitJson, problemCode);
                Map<String, Double> priors = priorPotPositions;
                if (priors == null || priors.isEmpty()) {
                    priors = Map.of("variable_resistor", targetPot);
                    Map<String, Object> settled = runPotHysteresisSettleToDcMap(
                            circuitJson,
                            priors,
                            problemCode,
                            shouldBootstrapOffPrior(targetPot, targetPot, offAtHigh));
                    if (!settled.containsKey("error")) {
                        return settled;
                    }
                } else {
                    double priorPot =
                            priors.getOrDefault("variable_resistor", targetPot);
                    Map<String, Object> settled = runPotHysteresisSettleToDcMap(
                            circuitJson,
                            priors,
                            problemCode,
                            shouldBootstrapOffPrior(priorPot, targetPot, offAtHigh));
                    if (!settled.containsKey("error")) {
                        return settled;
                    }
                }
                // Rare ngspice miss near the snap edge — fall back to independent OP.
            }
            if (AnalysisModes.usesTransient(problemCode)) {
                SimPhase phase = parseSimPhase(simPhaseName);
                if (AnalysisModes.usesSwitchCrossfade(problemCode)) {
                    // Master SPST open: L2.5/L2.6 → dark DC; L2.7 discharge phase →
                    // slow LED fade as parallel C empties through the LED.
                    if (AnalysisModes.usesMasterSwitch(problemCode)
                            && isMasterSwitchOpen(circuitJson)) {
                        if (AnalysisModes.usesMasterOffDischarge(problemCode)
                                && phase == SimPhase.discharge) {
                            return runMasterOffDischargeTran(circuitJson);
                        }
                        return runDcToMap(circuitJson, problemCode);
                    }
                    return switch (phase) {
                        case idle -> runSwitchIdlePowerOnTran(circuitJson);
                        case pressed -> AnalysisModes.usesParallelCapPolarity(problemCode)
                                ? runParallelCapPolarityFlip(circuitJson, true)
                                : runSwitchCrossfadeToClosed(circuitJson);
                        case discharge -> AnalysisModes.usesParallelCapPolarity(problemCode)
                                ? runParallelCapPolarityFlip(circuitJson, false)
                                : runSwitchCrossfadeToOpen(circuitJson);
                        case tapping -> runDcToMap(circuitJson, problemCode);
                    };
                }
                // CP.L2.14: master SPST + button slow brighten/fade (no slide crossfade).
                // GEN.L2.x: master open → dark DC; closed + idle → free-run oscillator .tran.
                if (AnalysisModes.usesMasterSwitch(problemCode)
                        && isMasterSwitchOpen(circuitJson)) {
                    return runDcToMap(circuitJson, problemCode);
                }
                if (AnalysisModes.usesFreeRunOscillator(problemCode)
                        && phase == SimPhase.idle) {
                    return runFreeRunOscillatorTran(circuitJson, problemCode);
                }
                return switch (phase) {
                    case idle -> runDcToMap(circuitJson, problemCode);
                    // TCP.L1.3: charge .tran so instant-on (low R_charge) can be
                    // distinguished from slow-charge topologies in validation.
                    // TCP.L3.5: short edge .tran (flash); validation uses tapping.
                    case pressed -> AnalysisModes.usesButtonTapTrain(problemCode)
                            ? runButtonEdgePressTranToMap(circuitJson)
                            : AnalysisModes.usesSlowCharge(problemCode)
                                            || "TCP.L1.3".equals(problemCode)
                                    ? runChargeTranToMap(circuitJson, problemCode)
                                    : runDcToMap(circuitJson, problemCode);
                    case tapping -> runButtonTapTrainToMap(circuitJson);
                    case discharge -> AnalysisModes.usesPotStepDischarge(problemCode)
                            ? runPotStepDischargeTranToMap(circuitJson, priorPotPositions)
                            : AnalysisModes.usesButtonTapTrain(problemCode)
                                    ? runButtonEdgeReleaseTranToMap(circuitJson)
                                    : runDischargeTranToMap(circuitJson, problemCode);
                };
            }

            return runDcToMap(circuitJson, problemCode);
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }

    private Map<String, Object> runDcToMap(String circuitJson) throws Exception {
        return runDcToMap(circuitJson, null);
    }

    private Map<String, Object> runDcToMap(String circuitJson, String problemCode)
            throws Exception {
        Map<String, Double> nodeVoltages = runDcAndParse(circuitJson, problemCode);
        Map<String, Object> componentVoltages =
                computeComponentVoltages(circuitJson, nodeVoltages);

        Map<String, Object> result = new HashMap<>();
        result.put("analysis", "dc");
        result.put("nodes", nodeVoltages);
        result.put("components", componentVoltages);
        return result;
    }

    private Map<String, Object> runChargeTranToMap(String circuitJson) throws Exception {
        return runChargeTranToMap(circuitJson, null);
    }

    private Map<String, Object> runChargeTranToMap(String circuitJson, String problemCode)
            throws Exception {
        // Frontend sends button closed during pressed phase; ICs must come from
        // the uncharged idle state (button open), not the pressed steady state.
        String idleJson = SpiceGenerator.applySwitchStates(
                circuitJson, Map.of("button_1", "open"));
        Map<String, Double> idleNodes = runDcAndParse(idleJson, problemCode);
        TranScenario scenario = "DTR.L2.12".equals(problemCode)
                ? TranScenario.delayedCharge()
                : TranScenario.charge();
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateChargeTranSpice(
                        circuitJson,
                        idleNodes,
                        scenario,
                        problemCode));
    }

    /**
     * TCP.L3.5: ICs from button-open DC, then periodic button PWL so capacitive
     * base coupling can light the lamp only while tapping.
     */
    private Map<String, Object> runButtonTapTrainToMap(String circuitJson) throws Exception {
        String idleJson = SpiceGenerator.applySwitchStates(
                circuitJson, Map.of("button_1", "open", "switch", "closed"));
        Map<String, Double> idleNodes = runDcAndParse(idleJson);
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateChargeTranSpice(
                        circuitJson,
                        idleNodes,
                        TranScenario.buttonTapTrain()));
    }

    /** TCP.L3.5 live press: short closed-button edge from button-open ICs. */
    private Map<String, Object> runButtonEdgePressTranToMap(String circuitJson)
            throws Exception {
        String idleJson = SpiceGenerator.applySwitchStates(
                circuitJson, Map.of("button_1", "open", "switch", "closed"));
        Map<String, Double> idleNodes = runDcAndParse(idleJson);
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateChargeTranSpice(
                        circuitJson,
                        idleNodes,
                        TranScenario.buttonEdgePress()));
    }

    /** TCP.L3.5 live release: short open-button edge from button-closed ICs. */
    private Map<String, Object> runButtonEdgeReleaseTranToMap(String circuitJson)
            throws Exception {
        String chargedJson = SpiceGenerator.applySwitchStates(
                circuitJson, Map.of("button_1", "closed", "switch", "closed"));
        Map<String, Double> chargedNodes = runDcAndParse(chargedJson);
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateDischargeTranSpice(
                        circuitJson,
                        chargedNodes,
                        TranScenario.buttonEdgeRelease()));
    }

    private Map<String, Object> runDischargeTranToMap(String circuitJson) throws Exception {
        return runDischargeTranToMap(circuitJson, null);
    }

    private Map<String, Object> runDischargeTranToMap(String circuitJson, String problemCode)
            throws Exception {
        String chargedJson = SpiceGenerator.applySwitchStates(
                circuitJson, Map.of("button_1", "closed"));
        Map<String, Double> chargedNodes = runDcAndParse(chargedJson, problemCode);
        TranScenario scenario = AnalysisModes.usesLongHoldDischarge(problemCode)
                ? TranScenario.longHoldDischarge()
                : AnalysisModes.usesDelayedReclaimDischarge(problemCode)
                        ? TranScenario.delayedReclaimDischarge()
                        : TranScenario.discharge();
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateDischargeTranSpice(
                        circuitJson,
                        chargedNodes,
                        scenario,
                        problemCode));
    }

    /**
     * DI.L3.6: capacitor charged at a prior pot setting, then .tran at the current
     * (usually dimmer) pot so one LED can hold while the other extinguishes.
     * Live UI passes {@code priorPotPositions}; validation omits them and uses the
     * inverted extreme (bright → dim).
     */
    private Map<String, Object> runPotStepDischargeTranToMap(
            String circuitJson, Map<String, Double> priorPotPositions) throws Exception {
        String chargedJson =
                priorPotPositions != null && !priorPotPositions.isEmpty()
                        ? SpiceGenerator.applyPotPositions(circuitJson, priorPotPositions)
                        : SpiceGenerator.invertAllPotPositions(circuitJson);
        Map<String, Double> chargedNodes = runDcAndParse(chargedJson);
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateDischargeTranSpice(
                        circuitJson,
                        chargedNodes,
                        TranScenario.discharge()));
    }

    /**
     * TFB.L3.3: DC at the prior pot, then a short closed .tran at the new pot with
     * those ICs. Collapses to a DC-shaped result so the live lamp snaps with the
     * positive-feedback latch instead of independent OP solutions in the dim band.
     *
     * @param bootstrapOffPrior when true, ICs come from switch-open DC at the prior
     *        pot so the latch starts in a known-off state (bistable .op can otherwise
     *        land on the ON branch at the off extreme).
     */
    private Map<String, Object> runPotHysteresisSettleToDcMap(
            String circuitJson,
            Map<String, Double> priorPotPositions,
            String problemCode,
            boolean bootstrapOffPrior) throws Exception {
        Map<String, Double> priorNodes;
        if (bootstrapOffPrior) {
            String openJson = SpiceGenerator.applySwitchStates(
                    circuitJson, Map.of("switch", "open"));
            openJson = SpiceGenerator.applyPotPositions(openJson, priorPotPositions);
            priorNodes = runDcAndParse(openJson, problemCode);
        } else {
            String priorJson =
                    SpiceGenerator.applyPotPositions(circuitJson, priorPotPositions);
            priorNodes = runDcAndParse(priorJson, problemCode);
        }
        Map<String, Object> tran = simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateChargeTranSpice(
                        circuitJson,
                        priorNodes,
                        TranScenario.potSettle(),
                        problemCode));
        return collapseTranEndToDc(tran);
    }

    /**
     * TFB.L3.4: DC at the prior button/switch state, then a short settle .tran at
     * the current state so the latch can hold after button release.
     */
    private Map<String, Object> runButtonLatchSettleToDcMap(
            String circuitJson,
            Map<String, String> priorSwitchStates,
            String problemCode) throws Exception {
        String priorJson = SpiceGenerator.applySwitchStates(circuitJson, priorSwitchStates);
        Map<String, Double> priorNodes = runDcAndParse(priorJson, problemCode);
        Map<String, Object> tran = simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateChargeTranSpice(
                        circuitJson,
                        priorNodes,
                        TranScenario.switchSettle(),
                        problemCode));
        return collapseTranEndToDc(tran);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> collapseTranEndToDc(Map<String, Object> tranResult) {
        if (tranResult.containsKey("error")) {
            return tranResult;
        }
        Map<String, Object> seriesComponents =
                (Map<String, Object>) tranResult.getOrDefault("components", Map.of());
        Map<String, Object> components = new HashMap<>();
        Map<String, Double> nodes = new HashMap<>();

        for (Map.Entry<String, Object> entry : seriesComponents.entrySet()) {
            String id = entry.getKey();
            if (!(entry.getValue() instanceof Map<?, ?> metricsRaw)) {
                continue;
            }
            @SuppressWarnings("unchecked")
            Map<String, List<Double>> metrics = (Map<String, List<Double>>) metricsRaw;
            List<Double> voltages = metrics.get("voltage");
            List<Double> currents = metrics.get("current");
            List<Double> forward = metrics.get("forward_current");
            if (voltages != null && !voltages.isEmpty()) {
                components.put(id, voltages.get(voltages.size() - 1));
            }
            if (currents != null && !currents.isEmpty()) {
                double i = currents.get(currents.size() - 1);
                nodes.put("@r_" + id.toLowerCase() + "[i]", i);
                components.putIfAbsent(id, i);
            }
            if (forward != null && !forward.isEmpty()) {
                double i = forward.get(forward.size() - 1);
                nodes.put("@d_" + id.toLowerCase() + "[id]", i);
                components.putIfAbsent(id, i);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("analysis", "dc");
        result.put("nodes", nodes);
        result.put("components", components);
        return result;
    }

    /**
     * CP.L2.3 Simulate: .tran from uncharged UIC with the slide position in the
     * circuit JSON (left → green charges up). Same result shape as toggle runs.
     */
    private Map<String, Object> runSwitchIdlePowerOnTran(String circuitJson)
            throws Exception {
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateTranSpice(
                        circuitJson,
                        TranScenario.idlePowerOn()));
    }

    /**
     * GEN.L2.x: master closed — long UIC .tran so a free-running multivibrator
     * can blink the lamp without a button timeline.
     */
    private Map<String, Object> runFreeRunOscillatorTran(
            String circuitJson, String problemCode) throws Exception {
        TranScenario scenario;
        if ("GEN.L2.2".equals(problemCode) || "GEN.L2.4".equals(problemCode)) {
            scenario = TranScenario.freeRunSlowOscillator();
        } else if ("GEN.L2.3".equals(problemCode)) {
            scenario = TranScenario.freeRunMediumOscillator();
        } else if ("GEN.L2.5".equals(problemCode)) {
            scenario = TranScenario.freeRunMotorOscillator();
        } else {
            scenario = TranScenario.freeRunFastOscillator();
        }
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateTranSpice(circuitJson, scenario, problemCode));
    }

    /**
     * CP.L2.3: slide switch toggled to right — ICs from prior left DC, then right-position transient.
     * Uses role {@code slide_switch} (SPDT), not {@code button_1} / SPST {@code switch}.
     */
    private Map<String, Object> runSwitchCrossfadeToClosed(String circuitJson)
            throws Exception {
        String priorJson = SpiceGenerator.applyAllSlideStates(circuitJson, "left");
        Map<String, Double> priorNodes = runDcAndParse(priorJson);
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateChargeTranSpice(
                        circuitJson,
                        priorNodes,
                        TranScenario.charge()));
    }

    /**
     * CP.L2.3: slide switch toggled to left — ICs from prior right DC, then left-position transient.
     */
    private Map<String, Object> runSwitchCrossfadeToOpen(String circuitJson)
            throws Exception {
        String priorJson = SpiceGenerator.applyAllSlideStates(circuitJson, "right");
        Map<String, Double> priorNodes = runDcAndParse(priorJson);
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateDischargeTranSpice(
                        circuitJson,
                        priorNodes,
                        TranScenario.discharge()));
    }

    /**
     * CP.L2.7: slide polarity flip with slow PWL + prior-DC ICs (parallel C crossfade).
     *
     * @param toRight true when sliding to A–C (pressed); false when sliding to A–B (discharge)
     */
    private Map<String, Object> runParallelCapPolarityFlip(
            String circuitJson, boolean toRight) throws Exception {
        String priorJson = SpiceGenerator.applyAllSlideStates(
                circuitJson, toRight ? "left" : "right");
        Map<String, Double> priorNodes = runDcAndParse(priorJson);
        TranScenario scenario = toRight
                ? TranScenario.charge()
                : TranScenario.discharge();
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateParallelCapPolarityTranSpice(
                        circuitJson, priorNodes, toRight, scenario));
    }

    /**
     * CP.L2.7: master opened — ICs from master-closed DC, then open-switch discharge.
     */
    private Map<String, Object> runMasterOffDischargeTran(String circuitJson)
            throws Exception {
        String chargedJson = SpiceGenerator.applySwitchStates(
                circuitJson, Map.of("switch", "closed"));
        Map<String, Double> chargedNodes = runDcAndParse(chargedJson);
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateDischargeTranSpice(
                        circuitJson,
                        chargedNodes,
                        TranScenario.discharge()));
    }

    private SimPhase parseSimPhase(String simPhaseName) {
        if (simPhaseName == null || simPhaseName.isBlank()) {
            return SimPhase.idle;
        }
        try {
            return SimPhase.valueOf(simPhaseName.trim().toLowerCase());
        } catch (IllegalArgumentException e) {
            return SimPhase.idle;
        }
    }

    /**
     * CP.L2.5 master SPST ({@code role=switch}): when open, idle sim is dark DC only.
     */
    @SuppressWarnings("unchecked")
    private boolean isMasterSwitchOpen(String circuitJson) throws Exception {
        Map<String, Object> data = objectMapper.readValue(circuitJson, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");
        if (components == null) {
            return true;
        }
        for (Map<String, Object> comp : components) {
            if (!"switch".equals(comp.get("role"))) {
                continue;
            }
            if (!"switch".equals(comp.get("type"))) {
                continue;
            }
            return !"closed".equals(comp.get("state"));
        }
        return true;
    }

    private Map<String, Object> simulateTranToMap(String circuitJson, TranSpiceBuild build)
            throws Exception {
        String runId = UUID.randomUUID().toString().replace("-", "");
        Path circuitFile = Paths.get("circuit-" + runId + ".cir");
        Path wrdataFile = Paths.get("tran_out.txt");
        Path logFile = Paths.get("output-" + runId + ".txt");

        try {
            Files.deleteIfExists(wrdataFile);
            Files.writeString(circuitFile, build.netlist());
            NgspiceService.runNgspice(circuitFile.toString(), logFile.toString());

            int probeCount = build.probes().size();
            if (probeCount == 0) {
                // Incomplete board (e.g. slide+cap without motor/LED): no animated
                // series to plot — fall back to steady DC instead of failing.
                return runDcToMap(circuitJson);
            }

            if (!Files.exists(wrdataFile)) {
                throw new RuntimeException("ngspice did not produce tran_out.txt");
            }

            NgspiceService.WrdataSeries series =
                    NgspiceService.parseWrdata(wrdataFile.toString(), probeCount);

            if (series.time().isEmpty()) {
                throw new RuntimeException("Transient simulation produced no data");
            }

            NgspiceService.WrdataSeries thinned = thinSeries(series, MAX_TRAN_POINTS);
            Map<String, Object> components = buildComponentSeries(build.probes(), thinned);

            TranScenario scenario = build.scenario();
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("analysis", "tran");
            result.put("step", scenario.step());
            result.put("stop", scenario.stop());
            result.put("simPhase", scenario.simPhaseLabel());
            result.put("time", roundList(thinned.time()));
            result.put("components", components);
            return result;
        } finally {
            Files.deleteIfExists(circuitFile);
            Files.deleteIfExists(wrdataFile);
            Files.deleteIfExists(logFile);
        }
    }

    private Map<String, Object> buildComponentSeries(
            List<TranProbe> probes,
            NgspiceService.WrdataSeries series) {
        Map<String, Map<String, List<Double>>> grouped = new LinkedHashMap<>();

        for (int i = 0; i < probes.size(); i++) {
            TranProbe probe = probes.get(i);
            List<Double> values = roundList(series.probeValues().get(i));
            grouped.computeIfAbsent(probe.componentId(), key -> new LinkedHashMap<>())
                    .put(probe.metric(), values);
        }

        Map<String, Object> components = new LinkedHashMap<>();
        grouped.forEach((id, metrics) -> components.put(id, metrics));
        return components;
    }

    private NgspiceService.WrdataSeries thinSeries(
            NgspiceService.WrdataSeries series, int maxPoints) {
        int size = series.time().size();
        if (size <= maxPoints) {
            return series;
        }

        int stride = (int) Math.ceil((double) size / maxPoints);
        List<Double> time = new ArrayList<>();
        List<List<Double>> probeValues = new ArrayList<>();
        for (int i = 0; i < series.probeValues().size(); i++) {
            probeValues.add(new ArrayList<>());
        }

        for (int i = 0; i < size; i += stride) {
            time.add(series.time().get(i));
            for (int p = 0; p < series.probeValues().size(); p++) {
                probeValues.get(p).add(series.probeValues().get(p).get(i));
            }
        }

        int last = size - 1;
        if (time.get(time.size() - 1) < series.time().get(last)) {
            time.add(series.time().get(last));
            for (int p = 0; p < series.probeValues().size(); p++) {
                probeValues.get(p).add(series.probeValues().get(p).get(last));
            }
        }

        return new NgspiceService.WrdataSeries(time, probeValues);
    }

    private Map<String, Double> runDcAndParse(String circuitJson) throws Exception {
        return runDcAndParse(circuitJson, null);
    }

    private Map<String, Double> runDcAndParse(String circuitJson, String problemCode)
            throws Exception {
        String spice = SpiceGenerator.generateSpice(circuitJson, problemCode);
        String runId = UUID.randomUUID().toString().replace("-", "");
        Path circuitFile = Paths.get("circuit-" + runId + ".cir");
        Path logFile = Paths.get("output-" + runId + ".txt");

        try {
            Files.writeString(circuitFile, spice);
            NgspiceService.runNgspice(circuitFile.toString(), logFile.toString());
            return NgspiceService.parse(logFile.toString());
        } finally {
            Files.deleteIfExists(circuitFile);
            Files.deleteIfExists(logFile);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> computeComponentVoltages(
            String circuitJson,
            Map<String, Double> nodeVoltages) throws Exception {

        Map<String, Object> data = objectMapper.readValue(circuitJson, Map.class);

        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        Map<String, Object> result = new HashMap<>();
        for (Map<String, Object> comp : components) {

            String id = (String) comp.get("id");
            String type = (String) comp.get("type");
            List<String> nodes = (List<String>) comp.get("nodes");

            if (nodes == null || nodes.size() < 2) continue;

            String n1 = nodes.get(0);
            String n2 = nodes.get(1);

            double v1 = getVoltage(n1, nodeVoltages);
            double v2 = getVoltage(n2, nodeVoltages);
            double voltage = v1 - v2;

            switch (type) {

                case "motor" -> {
                    String currentKey = "@r_" + id.toLowerCase() + "[i]";
                    double current = nodeVoltages.getOrDefault(currentKey, 0.0);
                    result.put(id, clean(current));
                }

                case "slide_switch" -> {
                    String state = (String) comp.get("state");

                    String common = nodes.get(0);
                    String active = "left".equals(state) ? nodes.get(1) : nodes.get(2);

                    double vCommon = getVoltage(common, nodeVoltages);
                    double vActive = getVoltage(active, nodeVoltages);

                    result.put(id, clean(vCommon - vActive));
                }

                case "variable_resistor" -> {
                    String input = nodes.get(1);
                    String wiper = nodes.get(0);

                    double vInput = getVoltage(input, nodeVoltages);
                    double vWiper = getVoltage(wiper, nodeVoltages);

                    result.put(id, clean(vInput - vWiper));
                }

                case "transistor" -> {
                    String base = nodes.get(0);
                    String collector = nodes.get(1);
                    String emitter = nodes.get(2);

                    double vB = getVoltage(base, nodeVoltages);
                    double vC = getVoltage(collector, nodeVoltages);
                    double vE = getVoltage(emitter, nodeVoltages);

                    double vbe = vB - vE;
                    double vce = vC - vE;

                    result.put(id + "_vbe", clean(vbe));
                    result.put(id + "_vce", clean(vce));

                    double ic = nodeVoltages.getOrDefault("@q_" + id.toLowerCase() + "[ic]", 0.0);
                    double ib = nodeVoltages.getOrDefault("@q_" + id.toLowerCase() + "[ib]", 0.0);
                    double ie = nodeVoltages.getOrDefault("@q_" + id.toLowerCase() + "[ie]", 0.0);

                    result.put(id + "_ic", clean(ic));
                    result.put(id + "_ib", clean(ib));
                    result.put(id + "_ie", clean(ie));

                    String state;
                    if (vbe < 0.6) {
                        state = "CUTOFF";
                    } else if (vce < 0.2) {
                        state = "SATURATION";
                    } else {
                        state = "ACTIVE";
                    }

                    result.put(id + "_state", state);
                }

                default -> result.put(id, clean(voltage));
            }
        }

        return result;
    }

    private List<Double> roundList(List<Double> values) {
        List<Double> rounded = new ArrayList<>(values.size());
        for (Double value : values) {
            rounded.add(clean(value));
        }
        return rounded;
    }

    private double clean(double value) {
        if (Math.abs(value) < 1e-6) return 0.0;

        double roundedInt = Math.round(value);
        if (Math.abs(value - roundedInt) < 1e-6) return roundedInt;

        return Math.round(value * 10000.0) / 10000.0;
    }

    private double getVoltage(String node, Map<String, Double> nodeVoltages) {
        if (node.equals("0")) {
            return 0.0;
        }
        String key = "v(" + node.toLowerCase() + ")";
        if (nodeVoltages.containsKey(key)) {
            return nodeVoltages.get(key);
        }
        return nodeVoltages.getOrDefault("v(" + node + ")", 0.0);
    }

    private static String escapeJson(String message) {
        if (message == null) {
            return "";
        }
        return message.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
