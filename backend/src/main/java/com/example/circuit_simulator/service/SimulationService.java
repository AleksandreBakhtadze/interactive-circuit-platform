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

    public String simulate(String circuitJson) {
        return simulate(circuitJson, null);
    }

    public String simulate(String circuitJson, String problemCode) {
        return simulate(circuitJson, problemCode, null);
    }

    public String simulate(String circuitJson, String problemCode, String simPhase) {
        try {
            return objectMapper.writeValueAsString(
                    simulateToMap(circuitJson, problemCode, simPhase));
        } catch (Exception e) {
            return "{ \"error\": \"" + escapeJson(e.getMessage()) + "\" }";
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> simulateToMap(String circuitJson) throws Exception {
        return simulateToMap(circuitJson, null, null);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> simulateToMap(String circuitJson, String problemCode)
            throws Exception {
        return simulateToMap(circuitJson, problemCode, null);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> simulateToMap(
            String circuitJson, String problemCode, String simPhaseName) throws Exception {
        try {
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
                        return runDcToMap(circuitJson);
                    }
                    return switch (phase) {
                        case idle -> runSwitchIdlePowerOnTran(circuitJson);
                        case pressed -> AnalysisModes.usesParallelCapPolarity(problemCode)
                                ? runParallelCapPolarityFlip(circuitJson, true)
                                : runSwitchCrossfadeToClosed(circuitJson);
                        case discharge -> AnalysisModes.usesParallelCapPolarity(problemCode)
                                ? runParallelCapPolarityFlip(circuitJson, false)
                                : runSwitchCrossfadeToOpen(circuitJson);
                    };
                }
                return switch (phase) {
                    case idle -> runDcToMap(circuitJson);
                    case pressed -> AnalysisModes.usesSlowCharge(problemCode)
                            ? runChargeTranToMap(circuitJson)
                            : runDcToMap(circuitJson);
                    case discharge -> runDischargeTranToMap(circuitJson);
                };
            }

            return runDcToMap(circuitJson);
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }

    private Map<String, Object> runDcToMap(String circuitJson) throws Exception {
        Map<String, Double> nodeVoltages = runDcAndParse(circuitJson);
        Map<String, Object> componentVoltages =
                computeComponentVoltages(circuitJson, nodeVoltages);

        Map<String, Object> result = new HashMap<>();
        result.put("analysis", "dc");
        result.put("nodes", nodeVoltages);
        result.put("components", componentVoltages);
        return result;
    }

    private Map<String, Object> runChargeTranToMap(String circuitJson) throws Exception {
        // Frontend sends button closed during pressed phase; ICs must come from
        // the uncharged idle state (button open), not the pressed steady state.
        String idleJson = SpiceGenerator.applySwitchStates(
                circuitJson, Map.of("button_1", "open"));
        Map<String, Double> idleNodes = runDcAndParse(idleJson);
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateChargeTranSpice(
                        circuitJson,
                        idleNodes,
                        TranScenario.charge()));
    }

    private Map<String, Object> runDischargeTranToMap(String circuitJson) throws Exception {
        String chargedJson = SpiceGenerator.applySwitchStates(
                circuitJson, Map.of("button_1", "closed"));
        Map<String, Double> chargedNodes = runDcAndParse(chargedJson);
        return simulateTranToMap(
                circuitJson,
                SpiceGenerator.generateDischargeTranSpice(
                        circuitJson,
                        chargedNodes,
                        TranScenario.discharge()));
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
     * CP.L2.3: slide switch toggled to right — ICs from prior left DC, then right-position transient.
     * Uses role {@code slide_switch} (SPDT), not {@code button_1} / SPST {@code switch}.
     */
    private Map<String, Object> runSwitchCrossfadeToClosed(String circuitJson)
            throws Exception {
        String priorJson = SpiceGenerator.applySwitchStates(
                circuitJson, Map.of("slide_switch", "left"));
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
        String priorJson = SpiceGenerator.applySwitchStates(
                circuitJson, Map.of("slide_switch", "right"));
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
        String priorJson = SpiceGenerator.applySwitchStates(
                circuitJson,
                Map.of("slide_switch", toRight ? "left" : "right"));
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
                throw new RuntimeException("No transient probes defined for circuit");
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
        String spice = SpiceGenerator.generateSpice(circuitJson);
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
