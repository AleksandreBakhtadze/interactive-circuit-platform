package com.example.circuit_simulator.service;

import com.example.circuit_simulator.dto.*;
import com.example.circuit_simulator.utils.SpiceGenerator;
import com.example.circuit_simulator.validation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CircuitValidationService {

    private final SimulationService simulationService;
    private final ValidationSpecRegistry specRegistry;
    private final ObjectMapper objectMapper;

    /** Signed motor current extremum from the previous validation case (CP.L2.8). */
    private final ThreadLocal<Double> lastMotorSignedExtremum = new ThreadLocal<>();

    /** DC motor |I| from the previous case (DM.L2.3 either-throw speed ratio). */
    private final ThreadLocal<Double> lastMotorCurrent = new ThreadLocal<>();

    /** DC motor signed I from the previous case (DM.L2.6 polarity reverse). */
    private final ThreadLocal<Double> lastMotorSignedCurrent = new ThreadLocal<>();

    /** Bitmask of lit LED roles from the previous case (SW.L1.1 exclusive toggle). */
    private final ThreadLocal<Integer> lastLitLedMask = new ThreadLocal<>();

    /** Load current from the previous case (SW dim→bright: LED or lamp). */
    private final ThreadLocal<Double> lastLedForwardCurrent = new ThreadLocal<>();

    /** Lamp |I| from the previous case (SW.L1.13 lamp+LED together). */
    private final ThreadLocal<Double> lastLampCurrent = new ThreadLocal<>();

    /** Whether the lamp was lit in the previous case (SW.L3.6 3-way toggle). */
    private final ThreadLocal<Boolean> lastLampLit = new ThreadLocal<>();

    /** SW.L3.11: saw red exclusive (Vf clamp) on any press case so far. */
    private final ThreadLocal<Boolean> sawExclusiveRed = new ThreadLocal<>();

    public ValidationResultDTO validate(String problemCode, String circuitJson) throws Exception {
        lastMotorSignedExtremum.set(null);
        lastMotorCurrent.set(null);
        lastMotorSignedCurrent.set(null);
        lastLitLedMask.set(null);
        lastLedForwardCurrent.set(null);
        lastLampCurrent.set(null);
        lastLampLit.set(null);
        sawExclusiveRed.set(false);
        try {
            return validateInner(problemCode, circuitJson);
        } finally {
            lastMotorSignedExtremum.remove();
            lastMotorCurrent.remove();
            lastMotorSignedCurrent.remove();
            lastLitLedMask.remove();
            lastLedForwardCurrent.remove();
            lastLampCurrent.remove();
            lastLampLit.remove();
            sawExclusiveRed.remove();
        }
    }

    private ValidationResultDTO validateInner(String problemCode, String circuitJson)
            throws Exception {
        ProblemValidationSpec spec = specRegistry.findByProblemCode(problemCode)
                .orElseThrow(() -> new RuntimeException(
                        "No validation spec for problem: " + problemCode));

        circuitJson = SpiceGenerator.normalizeSeriesSupplyPolarity(circuitJson);

        Map<String, Object> circuit = objectMapper.readValue(circuitJson, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) circuit.get("components");

        if (components == null || components.isEmpty()) {
            return ValidationResultDTO.builder()
                    .passed(false)
                    .message("Place components on the board before submitting.")
                    .messageKa("წარმატების შემოწმებამდე განათავსეთ დეტალები ფირზე.")
                    .cases(List.of())
                    .build();
        }

        Map<String, String> roleToId = indexRoles(components);
        List<String> missingRoles = findMissingRoles(spec, roleToId, components);
        if (problemCode != null
                && (problemCode.startsWith("TR.") || problemCode.startsWith("TCP."))) {
            boolean hasTransistor = components.stream()
                    .anyMatch(c -> "transistor".equals(c.get("type")));
            if (!hasTransistor) {
                missingRoles = new ArrayList<>(missingRoles);
                if (!missingRoles.contains("transistor")) {
                    missingRoles.add("transistor");
                }
            }
        }
        if (!missingRoles.isEmpty()) {
            return ValidationResultDTO.builder()
                    .passed(false)
                    .message("Missing parts on board: " + String.join(", ", missingRoles))
                    .messageKa("ფირზე აკლია: " + String.join(", ", missingRoles))
                    .cases(List.of())
                    .build();
        }

        List<String> floatingSupplies = findFloatingVoltageSources(components);
        if (!floatingSupplies.isEmpty()) {
            return ValidationResultDTO.builder()
                    .passed(false)
                    .message(
                            "A power supply is not connected to the rest of the circuit ("
                                    + String.join(", ", floatingSupplies)
                                    + "). Move it so its terminals share holes with the loop"
                                    + " — adjacent rows are not connected unless a part joins them.")
                    .messageKa(
                            "კვების წყარო არ არის შეერთებული დანარჩენ წრედთან ("
                                    + String.join(", ", floatingSupplies)
                                    + "). გადაადგილეთ ისე, რომ მისი პოლუსები იმავე ხვრელებში"
                                    + " მოხვდეს, რაშიც წრედის სხვა დეტალები — მეზობელი მწკრივები"
                                    + " ერთმანეთს არ უკავშირდება.")
                    .cases(List.of())
                    .build();
        }

        // Pedagogical "first/second button" is not placement order — try both mappings.
        CaseEvaluation first = evaluateCases(
                spec, circuitJson, problemCode, roleToId, components, false, false);
        CaseEvaluation chosen = first;
        if (!first.allPassed() && specUsesTwoButtons(spec)) {
            CaseEvaluation swapped =
                    evaluateCases(
                            spec, circuitJson, problemCode, roleToId, components, true, false);
            if (swapped.allPassed()) {
                chosen = swapped;
            }
        }
        // DM.L2.13: voltage vs load SPDT — either placement order OK;
        // also retry inverted lamp/motor throw on the load SPDT.
        if (!chosen.allPassed() && "DM.L2.13".equals(problemCode)) {
            CaseEvaluation slideSwapped =
                    evaluateCases(
                            spec,
                            circuitJson,
                            problemCode,
                            roleToId,
                            components,
                            false,
                            false,
                            true,
                            false);
            if (slideSwapped.allPassed()) {
                chosen = slideSwapped;
            } else {
                CaseEvaluation loadInverted =
                        evaluateCases(
                                spec,
                                circuitJson,
                                problemCode,
                                roleToId,
                                components,
                                false,
                                false,
                                false,
                                true);
                if (loadInverted.allPassed()) {
                    chosen = loadInverted;
                } else {
                    CaseEvaluation both =
                            evaluateCases(
                                    spec,
                                    circuitJson,
                                    problemCode,
                                    roleToId,
                                    components,
                                    false,
                                    false,
                                    true,
                                    true);
                    if (both.allPassed()) {
                        chosen = both;
                    }
                }
            }
        }
        // Pot B↔C / wiper orientation — try inverted positions if needed (VR.L1.2).
        if (!chosen.allPassed() && specUsesPotPositions(spec)) {
            CaseEvaluation inverted =
                    evaluateCases(
                            spec, circuitJson, problemCode, roleToId, components, false, true);
            if (inverted.allPassed()) {
                chosen = inverted;
            } else if (specUsesTwoButtons(spec)) {
                CaseEvaluation invertedSwapped =
                        evaluateCases(
                                spec, circuitJson, problemCode, roleToId, components, true, true);
                if (invertedSwapped.allPassed()) {
                    chosen = invertedSwapped;
                }
            }
        }

        // Two rotated packs can cancel the loop (~0 A) when node order opposes.
        // Curriculum challenges mean series-aiding — retry with the second source
        // reversed (covers switch-between-supplies layouts without a shared rail).
        if (!chosen.allPassed() && countVoltageSources(components) == 2) {
            String flippedSupplyJson = flipSecondVoltageSource(circuitJson);
            CaseEvaluation flipped = evaluateCases(
                    spec, flippedSupplyJson, problemCode, roleToId, components, false, false);
            if (!flipped.allPassed() && specUsesTwoButtons(spec)) {
                flipped = evaluateCases(
                        spec, flippedSupplyJson, problemCode, roleToId, components, true, false);
            }
            if (!flipped.allPassed() && "DM.L2.13".equals(problemCode)) {
                for (boolean swapSl : new boolean[] {false, true}) {
                    for (boolean invLoad : new boolean[] {false, true}) {
                        if (!swapSl && !invLoad) {
                            continue;
                        }
                        CaseEvaluation attempt =
                                evaluateCases(
                                        spec,
                                        flippedSupplyJson,
                                        problemCode,
                                        roleToId,
                                        components,
                                        false,
                                        false,
                                        swapSl,
                                        invLoad);
                        if (attempt.allPassed()) {
                            flipped = attempt;
                            break;
                        }
                    }
                    if (flipped.allPassed()) {
                        break;
                    }
                }
            }
            if (!flipped.allPassed() && specUsesPotPositions(spec)) {
                CaseEvaluation flippedPots = evaluateCases(
                        spec, flippedSupplyJson, problemCode, roleToId, components, false, true);
                if (flippedPots.allPassed()) {
                    flipped = flippedPots;
                } else if (specUsesTwoButtons(spec)) {
                    CaseEvaluation flippedPotsSwapped = evaluateCases(
                            spec,
                            flippedSupplyJson,
                            problemCode,
                            roleToId,
                            components,
                            true,
                            true);
                    if (flippedPotsSwapped.allPassed()) {
                        flipped = flippedPotsSwapped;
                    }
                }
            }
            if (flipped.allPassed()) {
                chosen = flipped;
            }
        }

        String failDetailEn = summarizeFailedCases(chosen.caseResults(), false);
        String failDetailKa = summarizeFailedCases(chosen.caseResults(), true);

        return ValidationResultDTO.builder()
                .passed(chosen.allPassed())
                .message(chosen.allPassed()
                        ? "Correct! Your circuit behaves as required."
                        : "Not quite — check wiring and try again."
                                + (failDetailEn.isEmpty() ? "" : "\n" + failDetailEn))
                .messageKa(chosen.allPassed()
                        ? "სწორია! თქვენი წრედი სწორად მუშაობს."
                        : "ჯერ არაა სწორი — შეამოწმეთ შეერთებები და სცადეთ კვლავ."
                                + (failDetailKa.isEmpty() ? "" : "\n" + failDetailKa))
                .cases(chosen.caseResults())
                .build();
    }

    private record CaseEvaluation(boolean allPassed, List<CaseResultDTO> caseResults) {}

    private int countVoltageSources(List<Map<String, Object>> components) {
        int count = 0;
        for (Map<String, Object> component : components) {
            if ("voltage".equals(component.get("type"))) {
                count++;
            }
        }
        return count;
    }

    @SuppressWarnings("unchecked")
    private String flipSecondVoltageSource(String circuitJson) throws Exception {
        Map<String, Object> circuit = objectMapper.readValue(circuitJson, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) circuit.getOrDefault("components", List.of());
        int voltageIndex = 0;
        for (Map<String, Object> component : components) {
            if (!"voltage".equals(component.get("type"))) {
                continue;
            }
            voltageIndex++;
            if (voltageIndex != 2) {
                continue;
            }
            Object rawNodes = component.get("nodes");
            if (rawNodes instanceof List<?> nodes && nodes.size() >= 2) {
                List<Object> reversed = new ArrayList<>(nodes);
                Object first = reversed.get(0);
                reversed.set(0, reversed.get(1));
                reversed.set(1, first);
                component.put("nodes", reversed);
            }
            break;
        }
        return objectMapper.writeValueAsString(circuit);
    }

    /** Reverse every voltage source's node order (external soft-wire polarity swap). */
    @SuppressWarnings("unchecked")
    private String flipAllVoltageSources(String circuitJson) throws Exception {
        Map<String, Object> circuit = objectMapper.readValue(circuitJson, Map.class);
        List<Map<String, Object>> components =
                (List<Map<String, Object>>) circuit.getOrDefault("components", List.of());
        for (Map<String, Object> component : components) {
            if (!"voltage".equals(component.get("type"))) {
                continue;
            }
            Object rawNodes = component.get("nodes");
            if (rawNodes instanceof List<?> nodes && nodes.size() >= 2) {
                List<Object> reversed = new ArrayList<>(nodes);
                Object first = reversed.get(0);
                reversed.set(0, reversed.get(1));
                reversed.set(1, first);
                component.put("nodes", reversed);
            }
        }
        return objectMapper.writeValueAsString(circuit);
    }

    private boolean specUsesTwoButtons(ProblemValidationSpec spec) {
        boolean has1 = false;
        boolean has2 = false;
        for (ValidationCase c : spec.cases()) {
            if (c.switchStates().containsKey("button_1")) {
                has1 = true;
            }
            if (c.switchStates().containsKey("button_2")) {
                has2 = true;
            }
        }
        return has1 && has2;
    }

    private boolean specUsesPotPositions(ProblemValidationSpec spec) {
        for (ValidationCase c : spec.cases()) {
            if (c.potPositions() != null && !c.potPositions().isEmpty()) {
                return true;
            }
        }
        return false;
    }

    /** Invert pot wiper positions (0↔1) so either track orientation can match the spec. */
    private Map<String, Double> maybeInvertPotPositions(
            Map<String, Double> positions, boolean invertPots) {
        if (!invertPots || positions == null || positions.isEmpty()) {
            return positions == null ? Map.of() : positions;
        }
        Map<String, Double> out = new LinkedHashMap<>();
        for (Map.Entry<String, Double> e : positions.entrySet()) {
            double p = e.getValue() == null ? 0.5 : e.getValue();
            out.put(e.getKey(), 1.0 - p);
        }
        return out;
    }

    /** Swap button_1 ↔ button_2 keys so either physical placement can match "first/second". */
    private Map<String, String> maybeSwapButtonStates(
            Map<String, String> states, boolean swapButtons) {
        if (!swapButtons) {
            return states;
        }
        Map<String, String> out = new LinkedHashMap<>(states);
        boolean has1 = out.containsKey("button_1");
        boolean has2 = out.containsKey("button_2");
        if (!has1 && !has2) {
            return states;
        }
        String s1 = out.remove("button_1");
        String s2 = out.remove("button_2");
        if (s2 != null) {
            out.put("button_1", s2);
        }
        if (s1 != null) {
            out.put("button_2", s1);
        }
        return out;
    }

    /** Swap slide_switch_1 ↔ slide_switch_2 (DM.L2.13 voltage vs load SPDT placement). */
    private Map<String, String> maybeSwapSlideStates(
            Map<String, String> states, boolean swapSlides) {
        if (!swapSlides) {
            return states;
        }
        Map<String, String> out = new LinkedHashMap<>(states);
        if (!out.containsKey("slide_switch_1") && !out.containsKey("slide_switch_2")) {
            return states;
        }
        String s1 = out.remove("slide_switch_1");
        String s2 = out.remove("slide_switch_2");
        if (s2 != null) {
            out.put("slide_switch_1", s2);
        }
        if (s1 != null) {
            out.put("slide_switch_2", s1);
        }
        return out;
    }

    /** Flip left↔right on slide_switch_2 (DM.L2.13 lamp vs motor throw orientation). */
    private Map<String, String> maybeInvertLoadSlide(
            Map<String, String> states, boolean invertLoadSlide) {
        if (!invertLoadSlide || !states.containsKey("slide_switch_2")) {
            return states;
        }
        Map<String, String> out = new LinkedHashMap<>(states);
        String s = out.get("slide_switch_2");
        if ("left".equals(s)) {
            out.put("slide_switch_2", "right");
        } else if ("right".equals(s)) {
            out.put("slide_switch_2", "left");
        }
        return out;
    }

    private CaseEvaluation evaluateCases(
            ProblemValidationSpec spec,
            String circuitJson,
            String problemCode,
            Map<String, String> roleToId,
            List<Map<String, Object>> components,
            boolean swapButtons,
            boolean invertPots)
            throws Exception {
        return evaluateCases(
                spec,
                circuitJson,
                problemCode,
                roleToId,
                components,
                swapButtons,
                invertPots,
                false,
                false);
    }

    private CaseEvaluation evaluateCases(
            ProblemValidationSpec spec,
            String circuitJson,
            String problemCode,
            Map<String, String> roleToId,
            List<Map<String, Object>> components,
            boolean swapButtons,
            boolean invertPots,
            boolean swapSlides)
            throws Exception {
        return evaluateCases(
                spec,
                circuitJson,
                problemCode,
                roleToId,
                components,
                swapButtons,
                invertPots,
                swapSlides,
                false);
    }

    private CaseEvaluation evaluateCases(
            ProblemValidationSpec spec,
            String circuitJson,
            String problemCode,
            Map<String, String> roleToId,
            List<Map<String, Object>> components,
            boolean swapButtons,
            boolean invertPots,
            boolean swapSlides,
            boolean invertLoadSlide)
            throws Exception {
        List<CaseResultDTO> caseResults = new ArrayList<>();
        Map<String, Double> observedMetrics = new HashMap<>();
        boolean allPassed = true;

        for (ValidationCase validationCase : spec.cases()) {
            Map<String, String> states =
                    maybeInvertLoadSlide(
                            maybeSwapSlideStates(
                                    maybeSwapButtonStates(
                                            validationCase.switchStates(), swapButtons),
                                    swapSlides),
                            invertLoadSlide);
            String caseJson = SpiceGenerator.applySwitchStates(circuitJson, states);
            caseJson = SpiceGenerator.applyPotPositions(
                    caseJson,
                    maybeInvertPotPositions(validationCase.potPositions(), invertPots));
            caseJson = SpiceGenerator.applyLightLevels(
                    caseJson, validationCase.lightLevels());
            // DI.L3.7: soft-wire polarity swap — flip every pack (not only the 2nd).
            if ("DI.L3.7".equals(problemCode)
                    && validationCase.label() != null
                    && validationCase.label().contains("supply_reversed")) {
                caseJson = flipAllVoltageSources(caseJson);
            }
            Map<String, Object> simResult = validationCase.simPhase() != null
                    ? simulationService.simulateToMap(
                            caseJson, problemCode, validationCase.simPhase())
                    : simulationService.simulateToMap(caseJson, problemCode);

            if (simResult.containsKey("error")) {
                allPassed = false;
                caseResults.add(CaseResultDTO.builder()
                        .label(validationCase.label())
                        .labelKa(validationCase.labelKa())
                        .switchStates(validationCase.switchStates())
                        .passed(false)
                        .checks(List.of())
                        .build());
                continue;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> componentVoltages =
                    (Map<String, Object>) simResult.getOrDefault("components", Map.of());
            @SuppressWarnings("unchecked")
            Map<String, Double> nodes =
                    (Map<String, Double>) simResult.getOrDefault("nodes", Map.of());

            List<CheckResultDTO> checks = new ArrayList<>();
            boolean casePassed = true;

            for (ValidationCheck check : validationCase.checks()) {
                String spiceId = resolveSpiceId(check.role(), roleToId, components);
                double actual = readMetric(
                        check.metric(),
                        check.role(),
                        spiceId,
                        roleToId,
                        components,
                        componentVoltages,
                        nodes,
                        simResult);
                boolean checkPassed = compare(
                        check.op(),
                        actual,
                        check.value(),
                        observedMetrics,
                        check.role(),
                        check.metric());

                observedMetrics.put(
                        observationKey(validationCase.label(), check.role(), check.metric()),
                        actual);

                if (!checkPassed) {
                    casePassed = false;
                }

                checks.add(CheckResultDTO.builder()
                        .role(check.role())
                        .metric(check.metric())
                        .op(check.op())
                        .expected(check.value())
                        .actual(actual)
                        .passed(checkPassed)
                        .build());
            }

            if (!casePassed) {
                allPassed = false;
            }

            // Remember which LEDs were lit (for lit_set_changed on the next case).
            lastLitLedMask.set(litLedMask(roleToId, nodes));
            // Remember lamp and LED currents separately (SW.L1.13 has both).
            String lampId = resolveSpiceId("lamp", roleToId, components);
            if (lampId != null) {
                double lampI = readCurrent(lampId, nodes, false);
                lastLampCurrent.set(lampI);
                lastLampLit.set(lampI > 0.01);
            }
            double litLedI = maxLitLedForwardCurrent(roleToId, nodes);
            String led1Id = resolveSpiceId("led_1", roleToId, components);
            if (led1Id != null) {
                lastLedForwardCurrent.set(readCurrent(led1Id, nodes, true));
            } else if (litLedI > 0) {
                lastLedForwardCurrent.set(litLedI);
            } else if (lampId != null) {
                lastLedForwardCurrent.set(lastLampCurrent.get());
            }
            String motorId = resolveSpiceId("motor_1", roleToId, components);
            if (motorId != null) {
                lastMotorCurrent.set(readCurrent(motorId, nodes, false));
                lastMotorSignedCurrent.set(readCurrent(motorId, nodes, true));
            }

            caseResults.add(CaseResultDTO.builder()
                    .label(validationCase.label())
                    .labelKa(validationCase.labelKa())
                    .switchStates(validationCase.switchStates())
                    .passed(casePassed)
                    .checks(checks)
                    .build());
        }

        return new CaseEvaluation(allPassed, caseResults);
    }

    private String summarizeFailedCases(List<CaseResultDTO> caseResults, boolean ka) {
        StringBuilder sb = new StringBuilder();
        for (CaseResultDTO c : caseResults) {
            if (c.isPassed()) {
                continue;
            }
            String label = ka
                    ? (c.getLabelKa() != null ? c.getLabelKa() : c.getLabel())
                    : (c.getLabel() != null ? c.getLabel() : c.getLabelKa());
            if (label == null) {
                label = "?";
            }
            if (c.getChecks() == null || c.getChecks().isEmpty()) {
                if (sb.length() > 0) {
                    sb.append('\n');
                }
                sb.append("• ").append(label);
                continue;
            }
            for (CheckResultDTO check : c.getChecks()) {
                if (check.isPassed()) {
                    continue;
                }
                if (sb.length() > 0) {
                    sb.append('\n');
                }
                if ("lit_count".equals(check.getMetric())) {
                    sb.append("• ").append(label).append(": ");
                    if (ka) {
                        sb.append("ანთებული LED ")
                                .append(formatNum(check.getActual()))
                                .append(" (საჭიროა ")
                                .append(formatNum(check.getExpected()))
                                .append(')');
                    } else {
                        sb.append("lit LEDs ")
                                .append(formatNum(check.getActual()))
                                .append(" (need ")
                                .append(formatNum(check.getExpected()))
                                .append(')');
                    }
                } else if ("current_ratio".equals(check.getMetric())) {
                    sb.append("• ").append(label).append(": ");
                    if (ka) {
                        sb.append("ნათების განსხვავება ")
                                .append(formatNum(check.getActual()))
                                .append("× (საჭიროა > ")
                                .append(formatNum(check.getExpected()))
                                .append(')');
                    } else {
                        sb.append("brightness ratio ")
                                .append(formatNum(check.getActual()))
                                .append("× (need > ")
                                .append(formatNum(check.getExpected()))
                                .append(')');
                    }
                } else {
                    sb.append("• ").append(label);
                }
            }
        }
        return sb.toString();
    }

    private static String formatNum(double v) {
        if (Math.abs(v - Math.rint(v)) < 1e-9) {
            return String.valueOf((long) Math.rint(v));
        }
        return String.format(Locale.US, "%.4g", v);
    }

    private Map<String, String> indexRoles(List<Map<String, Object>> components) {
        Map<String, String> roleToId = new HashMap<>();
        for (Map<String, Object> comp : components) {
            String role = (String) comp.get("role");
            if (role != null) {
                roleToId.put(role, (String) comp.get("id"));
            }
        }
        return roleToId;
    }

    private List<String> findMissingRoles(
            ProblemValidationSpec spec,
            Map<String, String> roleToId,
            List<Map<String, Object>> components) {
        Set<String> required = new HashSet<>();
        for (ValidationCase c : spec.cases()) {
            required.addAll(c.switchStates().keySet());
            for (ValidationCheck check : c.checks()) {
                required.add(check.role());
            }
        }
        required.remove("power_supply");

        List<String> missing = new ArrayList<>();
        for (String role : required) {
            // Aggregate role used by lit_count / current_ratio checks — not a board part.
            if ("leds".equals(role)) {
                continue;
            }
            if (resolveSpiceId(role, roleToId, components) == null) {
                missing.add(role);
            }
        }
        return missing;
    }

    /**
     * Voltage sources whose terminals never appear on any other part — usually the pack
     * was placed on an adjacent row that looks touching but does not share holes.
     */
    @SuppressWarnings("unchecked")
    private List<String> findFloatingVoltageSources(List<Map<String, Object>> components) {
        Map<String, Integer> nodeUseCount = new HashMap<>();
        for (Map<String, Object> comp : components) {
            Object raw = comp.get("nodes");
            if (!(raw instanceof List<?> nodes)) {
                continue;
            }
            Set<String> seen = new HashSet<>();
            for (Object nodeObj : nodes) {
                if (nodeObj == null) {
                    continue;
                }
                String node = String.valueOf(nodeObj);
                if (!seen.add(node)) {
                    continue;
                }
                nodeUseCount.merge(node, 1, Integer::sum);
            }
        }

        List<String> floating = new ArrayList<>();
        for (Map<String, Object> comp : components) {
            if (!"voltage".equals(comp.get("type"))) {
                continue;
            }
            Object raw = comp.get("nodes");
            if (!(raw instanceof List<?> nodes) || nodes.size() < 2) {
                continue;
            }
            boolean shared = false;
            for (Object nodeObj : nodes) {
                if (nodeObj == null) {
                    continue;
                }
                String node = String.valueOf(nodeObj);
                // Ground "0" is always part of the circuit reference.
                if ("0".equals(node) || nodeUseCount.getOrDefault(node, 0) > 1) {
                    shared = true;
                    break;
                }
            }
            if (!shared) {
                String role = (String) comp.get("role");
                floating.add(role != null ? role : String.valueOf(comp.get("id")));
            }
        }
        return floating;
    }

    /**
     * Resolve a validation role to a spice component id.
     * Supports {@code led_green}/{@code led_red} via the LED {@code color} field
     * (placement order still uses {@code led_1}/{@code led_2} in the netlist).
     */
    private String resolveSpiceId(
            String role,
            Map<String, String> roleToId,
            List<Map<String, Object>> components) {
        if (role == null) {
            return null;
        }
        if (roleToId.containsKey(role)) {
            return roleToId.get(role);
        }
        if (role.startsWith("led_")) {
            String color = role.substring("led_".length());
            for (Map<String, Object> comp : components) {
                if (!"led".equals(comp.get("type"))) {
                    continue;
                }
                if (color.equals(comp.get("color"))) {
                    return (String) comp.get("id");
                }
            }
        }
        return null;
    }

    /** Forward current (A) treated as “lit” for RGB sequence timing. */
    private static final double LED_LIT_THRESHOLD = 0.0001;

    /** Fraction of each LED’s own peak used for rise/fall order (Vf, not |I|). */

    private double readMetric(
            String metric,
            String role,
            String spiceId,
            Map<String, String> roleToId,
            List<Map<String, Object>> components,
            Map<String, Object> componentVoltages,
            Map<String, Double> nodes,
            Map<String, Object> simResult) {

        // Count how many led_* roles have forward current above the lit threshold.
        if ("lit_count".equals(metric)) {
            return countLitLeds(roleToId, nodes);
        }
        // SW.L1.1: different LED lit than previous case (gt 0 = changed).
        if ("lit_set_changed".equals(metric)) {
            int mask = litLedMask(roleToId, nodes);
            Integer prev = lastLitLedMask.get();
            if (prev == null || prev == 0 || mask == 0) {
                return 0.0;
            }
            return prev != mask ? 1.0 : 0.0;
        }
        // SW.L3.6: lamp on↔off flipped vs previous case.
        if ("lamp_lit_changed".equals(metric)) {
            boolean now = spiceId != null && readCurrent(spiceId, nodes, false) > 0.01;
            Boolean prev = lastLampLit.get();
            if (prev == null) {
                return 0.0;
            }
            return now != prev ? 1.0 : 0.0;
        }
        // SW.L1.2: |I_now / I_prior| brightness change (either dim→bright or bright→dim).
        if ("forward_current_vs_prior_ratio".equals(metric)) {
            double now = spiceId == null ? 0.0 : readCurrent(spiceId, nodes, true);
            Double prev = lastLedForwardCurrent.get();
            if (prev == null || prev <= 1e-9 || now <= 1e-9) {
                return 0.0;
            }
            double a = now / prev;
            double b = prev / now;
            return Math.max(a, b);
        }
        // Max forward current among currently lit LEDs (SW.L2.10 color-agnostic).
        if ("lit_forward_current".equals(metric)) {
            return maxLitLedForwardCurrent(roleToId, nodes);
        }
        // lit LED current ÷ previous-case lit LED current (brighten only).
        if ("lit_forward_current_vs_prior".equals(metric)) {
            double now = maxLitLedForwardCurrent(roleToId, nodes);
            Double prev = lastLedForwardCurrent.get();
            if (prev == null || prev <= 1e-9) {
                return 0.0;
            }
            return now / prev;
        }
        // SW.L3.11: red lit and green+blue off (Vf clamp). Sticky OR across cases.
        if ("exclusive_red".equals(metric) || "saw_exclusive_red".equals(metric)) {
            double redI = forwardCurrentByColor(components, nodes, "red");
            double greenI = forwardCurrentByColor(components, nodes, "green");
            double blueI = forwardCurrentByColor(components, nodes, "blue");
            boolean now =
                    redI > 0.0005 && greenI < 0.0005 && blueI < 0.0005;
            if (now) {
                sawExclusiveRed.set(true);
            }
            if ("exclusive_red".equals(metric)) {
                return now ? 1.0 : 0.0;
            }
            return Boolean.TRUE.equals(sawExclusiveRed.get()) ? 1.0 : 0.0;
        }
        // SW.L1.2: this LED forward current ÷ previous-case current (brighten only).
        if ("forward_current_vs_prior".equals(metric)) {
            double now = spiceId == null ? 0.0 : readCurrent(spiceId, nodes, true);
            Double prev = lastLedForwardCurrent.get();
            if (prev == null || prev <= 1e-9) {
                return 0.0;
            }
            return now / prev;
        }
        // SW.L2.4 / L1.13: lamp |I_now| / |I_prior| (brighten only).
        if ("current_vs_prior".equals(metric)) {
            double now = spiceId == null ? 0.0 : readCurrent(spiceId, nodes, false);
            Double prev = priorLoadCurrent(role);
            if (prev == null || prev <= 1e-9) {
                return 0.0;
            }
            return now / prev;
        }
        // SW.L2.5: |I_now / I_prior| (either throw may be the dim path).
        if ("current_vs_prior_ratio".equals(metric)) {
            double now = spiceId == null ? 0.0 : readCurrent(spiceId, nodes, false);
            Double prev = priorLoadCurrent(role);
            if (prev == null || prev <= 1e-9 || now <= 1e-9) {
                return 0.0;
            }
            double a = now / prev;
            double b = prev / now;
            return Math.max(a, b);
        }
        // DM.L2.6: 1 if signed motor current flipped vs previous case (both spinning).
        if ("current_reversed_vs_prior".equals(metric)) {
            double now = spiceId == null ? 0.0 : readCurrent(spiceId, nodes, true);
            Double prev = lastMotorSignedCurrent.get();
            if (prev == null || Math.abs(prev) < 0.02 || Math.abs(now) < 0.02) {
                return 0.0;
            }
            return prev * now < 0 ? 1.0 : 0.0;
        }
        // max(I_f)/min(I_f) among lit LEDs — used for unequal-brightness checks.
        if ("current_ratio".equals(metric)) {
            return litLedCurrentRatio(roleToId, nodes);
        }
        if ("led_min_forward_current".equals(metric)) {
            return ledForwardCurrentExtreme(roleToId, nodes, false);
        }
        if ("led_max_forward_current".equals(metric)) {
            return ledForwardCurrentExtreme(roleToId, nodes, true);
        }

        // DI.L3.6: either LED may be the capacitor-hold branch.
        if ("leds".equals(role)
                && (metric.equals("tran_extinguish_time_min")
                        || metric.equals("tran_extinguish_time_max")
                        || metric.equals("tran_extinguish_time_spread")
                        || metric.equals("tran_forward_current_start_min")
                        || metric.equals("tran_forward_current_start_max")
                        || metric.equals("tran_forward_current_at_0.2_min")
                        || metric.equals("tran_forward_current_at_0.2_max"))) {
            return ledsTranCurrentAggregate(metric, roleToId, simResult);
        }

        // CP.L2.13: positive ⇒ this LED lights/extinguishes before otherRole.
        if (metric.startsWith("tran_lit_before:")
                || metric.startsWith("tran_extinguish_before:")) {
            boolean extinguish = metric.startsWith("tran_extinguish_before:");
            String otherRole = metric.substring(metric.indexOf(':') + 1);
            String otherId = resolveSpiceId(otherRole, roleToId, components);
            if (spiceId == null || otherId == null) {
                return 0.0;
            }
            double tSelf = extinguish
                    ? readTranExtinguishTime(simResult, spiceId)
                    : readTranLitTime(simResult, spiceId);
            double tOther = extinguish
                    ? readTranExtinguishTime(simResult, otherId)
                    : readTranLitTime(simResult, otherId);
            if (!Double.isFinite(tSelf) || !Double.isFinite(tOther)) {
                return 0.0;
            }
            return tOther - tSelf;
        }

        if (spiceId == null) {
            return 0.0;
        }

        if (metric.startsWith("tran_")) {
            return readTranMetric(metric, spiceId, simResult);
        }

        return switch (metric) {
            case "voltage" -> {
                Object v = componentVoltages.get(spiceId);
                yield v instanceof Number n ? Math.abs(n.doubleValue()) : 0.0;
            }
            // Signed diode/resistor current: positive = forward bias in ngspice netlist order.
            case "current" -> readCurrent(spiceId, nodes, false);
            case "forward_current" -> readCurrent(spiceId, nodes, true);
            default -> 0.0;
        };
    }

    private double countLitLeds(Map<String, String> roleToId, Map<String, Double> nodes) {
        return Integer.bitCount(litLedMask(roleToId, nodes));
    }

    /** Previous-case current for lamp vs LED / motor ratio metrics. */
    private Double priorLoadCurrent(String role) {
        if ("lamp".equals(role)) {
            Double lamp = lastLampCurrent.get();
            if (lamp != null) {
                return lamp;
            }
        }
        if (role != null && role.startsWith("motor")) {
            return lastMotorCurrent.get();
        }
        return lastLedForwardCurrent.get();
    }

    /** Max forward current among LEDs above the lit threshold (0 if none lit). */
    private double maxLitLedForwardCurrent(
            Map<String, String> roleToId, Map<String, Double> nodes) {
        double max = 0;
        for (Map.Entry<String, String> entry : roleToId.entrySet()) {
            if (!entry.getKey().startsWith("led_")) {
                continue;
            }
            // Skip color-alias roles (led_green) — placement roles led_1/led_2 cover each part.
            String suffix = entry.getKey().substring("led_".length());
            try {
                Integer.parseInt(suffix);
            } catch (NumberFormatException e) {
                continue;
            }
            double forward = readCurrent(entry.getValue(), nodes, true);
            if (forward > 0.0005) {
                max = Math.max(max, forward);
            }
        }
        return max;
    }

    private double forwardCurrentByColor(
            List<Map<String, Object>> components,
            Map<String, Double> nodes,
            String color) {
        if (components == null) {
            return 0.0;
        }
        for (Map<String, Object> comp : components) {
            if (!"led".equals(comp.get("type"))) {
                continue;
            }
            if (color.equals(comp.get("color"))) {
                return readCurrent((String) comp.get("id"), nodes, true);
            }
        }
        return 0.0;
    }

    /** Bit i set ⇒ led_(i+1) is forward-lit (placement order). */
    private int litLedMask(Map<String, String> roleToId, Map<String, Double> nodes) {
        int mask = 0;
        for (Map.Entry<String, String> entry : roleToId.entrySet()) {
            String role = entry.getKey();
            if (!role.startsWith("led_")) {
                continue;
            }
            double forward = readCurrent(entry.getValue(), nodes, true);
            if (forward <= 0.0005) {
                continue;
            }
            try {
                int index = Integer.parseInt(role.substring("led_".length()));
                if (index >= 1 && index <= 30) {
                    mask |= 1 << (index - 1);
                }
            } catch (NumberFormatException ignored) {
                // led_green / led_red style roles — skip bitmask index
            }
        }
        return mask;
    }

    /** Ratio of brightest to dimmest lit LED forward current (1 if fewer than 2 lit). */
    private double litLedCurrentRatio(Map<String, String> roleToId, Map<String, Double> nodes) {
        double max = 0;
        double min = Double.POSITIVE_INFINITY;
        int lit = 0;
        for (Map.Entry<String, String> entry : roleToId.entrySet()) {
            if (!entry.getKey().startsWith("led_")) {
                continue;
            }
            double forward = readCurrent(entry.getValue(), nodes, true);
            if (forward <= 1e-5) {
                continue;
            }
            lit += 1;
            max = Math.max(max, forward);
            min = Math.min(min, forward);
        }
        if (lit < 2 || min <= 0) {
            return 1.0;
        }
        return max / min;
    }

    /**
     * Aggregate LED transient metrics (DI.L3.6 hold vs direct branch).
     * An LED that stays lit through the whole .tran counts as extinguishing at the
     * last sample time (capacitor hold). Never-lit LEDs are ignored for extinguish
     * aggregates.
     */
    @SuppressWarnings("unchecked")
    private double ledsTranCurrentAggregate(
            String metric, Map<String, String> roleToId, Map<String, Object> simResult) {
        if (metric.startsWith("tran_forward_current_start_")
                || metric.startsWith("tran_forward_current_at_0.2_")) {
            double min = Double.POSITIVE_INFINITY;
            double max = Double.NEGATIVE_INFINITY;
            int n = 0;
            for (Map.Entry<String, String> entry : roleToId.entrySet()) {
                if (!entry.getKey().startsWith("led_")) {
                    continue;
                }
                double i = metric.startsWith("tran_forward_current_start_")
                        ? readTranMetric(
                                "tran_forward_current_start", entry.getValue(), simResult)
                        : readTranCurrentAtTime(simResult, entry.getValue(), 0.2);
                n += 1;
                min = Math.min(min, i);
                max = Math.max(max, i);
            }
            if (n == 0) {
                return 0.0;
            }
            return metric.endsWith("_min") ? min : max;
        }

        double min = Double.POSITIVE_INFINITY;
        double max = Double.NEGATIVE_INFINITY;
        int finite = 0;
        List<Double> times = (List<Double>) simResult.get("time");
        double lastT =
                times != null && !times.isEmpty() ? times.get(times.size() - 1) : 4.0;
        for (Map.Entry<String, String> entry : roleToId.entrySet()) {
            if (!entry.getKey().startsWith("led_")) {
                continue;
            }
            double t = readTranExtinguishTime(simResult, entry.getValue());
            if (!Double.isFinite(t)) {
                double peak = readTranMetric(
                        "tran_forward_current_peak", entry.getValue(), simResult);
                if (peak < LED_LIT_THRESHOLD) {
                    continue;
                }
                t = lastT;
            }
            finite += 1;
            min = Math.min(min, t);
            max = Math.max(max, t);
        }
        if (finite == 0) {
            return 0.0;
        }
        return switch (metric) {
            case "tran_extinguish_time_min" -> min;
            case "tran_extinguish_time_max" -> max;
            case "tran_extinguish_time_spread" -> finite >= 2 ? max - min : 0.0;
            default -> 0.0;
        };
    }

    private double ledForwardCurrentExtreme(
            Map<String, String> roleToId,
            Map<String, Double> nodes,
            boolean maximum) {
        double extreme = maximum ? 0.0 : Double.POSITIVE_INFINITY;
        boolean found = false;
        for (Map.Entry<String, String> entry : roleToId.entrySet()) {
            if (!entry.getKey().startsWith("led_")) {
                continue;
            }
            double forward = Math.max(0.0, readCurrent(entry.getValue(), nodes, true));
            extreme = maximum
                    ? Math.max(extreme, forward)
                    : Math.min(extreme, forward);
            found = true;
        }
        return found ? extreme : 0.0;
    }

    @SuppressWarnings("unchecked")
    private double readTranMetric(
            String metric, String spiceId, Map<String, Object> simResult) {
        if (!"tran".equals(simResult.get("analysis"))) {
            return 0.0;
        }

        Map<String, Object> components =
                (Map<String, Object>) simResult.getOrDefault("components", Map.of());
        Object compObj = components.get(spiceId);
        if (!(compObj instanceof Map<?, ?> comp)) {
            return 0.0;
        }

        List<Double> series = readTranSeries((Map<String, Object>) comp);
        if (series.isEmpty()) {
            return 0.0;
        }

        return switch (metric) {
            // Signed forward current: only positive values count as LED conduction.
            case "tran_forward_current_start" -> series.get(0);
            case "tran_forward_current_end" -> series.get(series.size() - 1);
            case "tran_forward_current_peak" -> series.stream()
                    .mapToDouble(v -> v)
                    .max()
                    .orElse(0.0);
            case "tran_forward_current_min" -> series.stream()
                    .mapToDouble(v -> v)
                    .min()
                    .orElse(0.0);
            // Motor (signed series): magnitude helpers + polarity flip across cases.
            case "tran_current_abs_start" -> Math.abs(series.get(0));
            case "tran_current_abs_end" -> Math.abs(series.get(series.size() - 1));
            case "tran_current_abs_early" ->
                    Math.abs(readTranCurrentAtTime(simResult, spiceId, 0.1));
            case "tran_current_abs_fall" ->
                    Math.abs(series.get(0)) - Math.abs(series.get(series.size() - 1));
            case "tran_current_abs_peak" -> {
                double peak = series.stream().mapToDouble(Math::abs).max().orElse(0.0);
                lastMotorSignedExtremum.set(signedExtremum(series));
                yield peak;
            }
            case "tran_current_flip_sign" -> {
                double ext = signedExtremum(series);
                Double prev = lastMotorSignedExtremum.get();
                lastMotorSignedExtremum.set(ext);
                if (prev == null
                        || Math.abs(prev) < 1e-6
                        || Math.abs(ext) < 1e-6) {
                    yield 0.0;
                }
                // Opposite signs → product < 0 (passes "lt 0").
                yield ext * prev;
            }
            // ~100 ms — soft RC turn-on (CP.L1.2 / CP.L2.3).
            case "tran_forward_current_early" ->
                    readTranCurrentAtTime(simResult, spiceId, 0.1);
            // ~50 ms — CP.L2.4 blackout window (12 V / 470 µF recovers by ~0.1 s).
            case "tran_forward_current_early_50ms" ->
                    readTranCurrentAtTime(simResult, spiceId, 0.05);
            // CP.L2.14: end − start (brighten) / start − end (fade).
            case "tran_forward_current_rise" ->
                    series.get(series.size() - 1) - series.get(0);
            case "tran_forward_current_fall" ->
                    series.get(0) - series.get(series.size() - 1);
            // early/end — < 1 means still rising at 0.1 s (gradual RC).
            case "tran_forward_current_early_ratio" -> {
                double end = series.get(series.size() - 1);
                if (end <= 1e-9) {
                    yield 1.0;
                }
                yield readTranCurrentAtTime(simResult, spiceId, 0.1) / end;
            }
            // First time I_f exceeds lit threshold (CP.L2.13 RGB sequence).
            case "tran_lit_time" -> readTranLitTime(simResult, spiceId);
            // First time I_f falls below lit threshold after being lit (discharge).
            case "tran_extinguish_time" -> readTranExtinguishTime(simResult, spiceId);
            default -> 0.0;
        };
    }

    /**
     * First sample time where forward current reaches the common visible-current
     * threshold. A peak-relative threshold is incorrect for RGB sequencing:
     * unequal series resistors make red's peak much larger than green/blue, so
     * (for example) 35% of red can occur after 35% of green even though red
     * visibly turns on first.
     */
    @SuppressWarnings("unchecked")
    private double readTranLitTime(Map<String, Object> simResult, String spiceId) {
        if (!"tran".equals(simResult.get("analysis"))) {
            return Double.POSITIVE_INFINITY;
        }
        List<Double> times = (List<Double>) simResult.get("time");
        if (times == null || times.isEmpty()) {
            return Double.POSITIVE_INFINITY;
        }
        Map<String, Object> components =
                (Map<String, Object>) simResult.getOrDefault("components", Map.of());
        Object compObj = components.get(spiceId);
        if (!(compObj instanceof Map<?, ?>)) {
            return Double.POSITIVE_INFINITY;
        }
        List<Double> series = readTranSeries((Map<String, Object>) compObj);
        if (series.size() != times.size()) {
            return Double.POSITIVE_INFINITY;
        }
        double peak = series.stream().mapToDouble(v -> v).max().orElse(0.0);
        if (peak < LED_LIT_THRESHOLD) {
            return Double.POSITIVE_INFINITY;
        }
        for (int i = 0; i < series.size(); i++) {
            if (series.get(i) >= LED_LIT_THRESHOLD) {
                return times.get(i);
            }
        }
        return Double.POSITIVE_INFINITY;
    }

    /**
     * First sample time where forward current drops below the common visible
     * threshold after having been lit. This mirrors the turn-on measurement and
     * avoids resistor-dependent peak levels changing the apparent RGB order.
     */
    @SuppressWarnings("unchecked")
    private double readTranExtinguishTime(Map<String, Object> simResult, String spiceId) {
        if (!"tran".equals(simResult.get("analysis"))) {
            return Double.POSITIVE_INFINITY;
        }
        List<Double> times = (List<Double>) simResult.get("time");
        if (times == null || times.isEmpty()) {
            return Double.POSITIVE_INFINITY;
        }
        Map<String, Object> components =
                (Map<String, Object>) simResult.getOrDefault("components", Map.of());
        Object compObj = components.get(spiceId);
        if (!(compObj instanceof Map<?, ?>)) {
            return Double.POSITIVE_INFINITY;
        }
        List<Double> series = readTranSeries((Map<String, Object>) compObj);
        if (series.size() != times.size()) {
            return Double.POSITIVE_INFINITY;
        }
        double peak = series.stream().mapToDouble(v -> v).max().orElse(0.0);
        if (peak < LED_LIT_THRESHOLD) {
            return Double.POSITIVE_INFINITY;
        }
        boolean wasAbove = false;
        for (int i = 0; i < series.size(); i++) {
            double iFwd = series.get(i);
            if (iFwd >= LED_LIT_THRESHOLD) {
                wasAbove = true;
            } else if (wasAbove) {
                return times.get(i);
            }
        }
        return Double.POSITIVE_INFINITY;
    }

    /** Series sample with the largest |value|, keeping sign (motor spin polarity). */
    private static double signedExtremum(List<Double> series) {
        double best = 0;
        double bestAbs = 0;
        for (double v : series) {
            double a = Math.abs(v);
            if (a > bestAbs) {
                bestAbs = a;
                best = v;
            }
        }
        return best;
    }

    @SuppressWarnings("unchecked")
    private double readTranCurrentAtTime(
            Map<String, Object> simResult, String spiceId, double targetSec) {
        List<Double> times = (List<Double>) simResult.get("time");
        if (times == null || times.isEmpty()) {
            return 0.0;
        }

        Map<String, Object> components =
                (Map<String, Object>) simResult.getOrDefault("components", Map.of());
        Object compObj = components.get(spiceId);
        if (!(compObj instanceof Map<?, ?>)) {
            return 0.0;
        }

        List<Double> series = readTranSeries((Map<String, Object>) compObj);
        if (series.size() != times.size()) {
            return 0.0;
        }

        for (int i = 0; i < times.size(); i++) {
            if (times.get(i) >= targetSec) {
                return series.get(i);
            }
        }
        return series.get(series.size() - 1);
    }

    @SuppressWarnings("unchecked")
    private List<Double> readTranSeries(Map<String, Object> compMetrics) {
        Object series = compMetrics.get("forward_current");
        if (!(series instanceof List<?> list)) {
            series = compMetrics.get("current");
        }
        if (!(series instanceof List<?> list)) {
            return List.of();
        }

        List<Double> values = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Number n) {
                values.add(n.doubleValue());
            }
        }
        return values;
    }

    private double readCurrent(String spiceId, Map<String, Double> nodes, boolean signed) {
        String lower = spiceId.toLowerCase();

        // Diodes / LEDs: ngspice reports diode current as [id]
        Double d = nodes.get("@d_" + lower + "[id]");
        if (d != null) {
            return signed ? d : Math.abs(d);
        }

        // Resistors (including lamp modeled as R)
        Double r = nodes.get("@r_" + lower + "[i]");
        if (r != null) {
            return signed ? r : Math.abs(r);
        }

        return 0.0;
    }

    private boolean compare(
            String op,
            double actual,
            double expected,
            Map<String, Double> observedMetrics,
            String role,
            String metric) {
        if (op.startsWith("gt_ref:") || op.startsWith("lt_ref:")) {
            String referenceCase = op.substring(op.indexOf(':') + 1);
            Double reference = observedMetrics.get(
                    observationKey(referenceCase, role, metric));
            if (reference == null) {
                return false;
            }
            double target = reference * expected;
            return op.startsWith("gt_ref:") ? actual > target : actual < target;
        }
        return switch (op) {
            case "gt" -> actual > expected;
            case "gte" -> actual >= expected;
            case "lt" -> actual < expected;
            case "lte" -> actual <= expected;
            case "eq" -> Math.abs(actual - expected) < 0.01;
            default -> false;
        };
    }

    private String observationKey(String caseLabel, String role, String metric) {
        return caseLabel + "\u0000" + role + "\u0000" + metric;
    }
}
