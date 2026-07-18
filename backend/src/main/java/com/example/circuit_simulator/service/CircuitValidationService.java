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

    public ValidationResultDTO validate(String problemCode, String circuitJson) throws Exception {
        ProblemValidationSpec spec = specRegistry.findByProblemCode(problemCode)
                .orElseThrow(() -> new RuntimeException(
                        "No validation spec for problem: " + problemCode));

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
        if (!missingRoles.isEmpty()) {
            return ValidationResultDTO.builder()
                    .passed(false)
                    .message("Missing parts on board: " + String.join(", ", missingRoles))
                    .messageKa("ფირზე აკლია: " + String.join(", ", missingRoles))
                    .cases(List.of())
                    .build();
        }

        // Pedagogical "first/second button" is not placement order — try both mappings.
        CaseEvaluation first = evaluateCases(spec, circuitJson, problemCode, roleToId, components, false);
        CaseEvaluation chosen = first;
        if (!first.allPassed() && specUsesTwoButtons(spec)) {
            CaseEvaluation swapped =
                    evaluateCases(spec, circuitJson, problemCode, roleToId, components, true);
            if (swapped.allPassed()) {
                chosen = swapped;
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

    private CaseEvaluation evaluateCases(
            ProblemValidationSpec spec,
            String circuitJson,
            String problemCode,
            Map<String, String> roleToId,
            List<Map<String, Object>> components,
            boolean swapButtons)
            throws Exception {
        List<CaseResultDTO> caseResults = new ArrayList<>();
        Map<String, Double> observedMetrics = new HashMap<>();
        boolean allPassed = true;

        for (ValidationCase validationCase : spec.cases()) {
            Map<String, String> states =
                    maybeSwapButtonStates(validationCase.switchStates(), swapButtons);
            String caseJson = SpiceGenerator.applySwitchStates(circuitJson, states);
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

    private double readMetric(
            String metric,
            String role,
            String spiceId,
            Map<String, String> roleToId,
            Map<String, Object> componentVoltages,
            Map<String, Double> nodes,
            Map<String, Object> simResult) {

        // Count how many led_* roles have forward current above the lit threshold.
        if ("lit_count".equals(metric)) {
            return countLitLeds(roleToId, nodes);
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
        double lit = 0;
        for (Map.Entry<String, String> entry : roleToId.entrySet()) {
            if (!entry.getKey().startsWith("led_")) {
                continue;
            }
            double forward = readCurrent(entry.getValue(), nodes, true);
            if (forward > 0.0001) {
                lit += 1;
            }
        }
        return lit;
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
            if (forward <= 0.0001) {
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
            // ~100 ms — soft RC turn-on (CP.L1.2 / CP.L2.3).
            case "tran_forward_current_early" ->
                    readTranCurrentAtTime(simResult, spiceId, 0.1);
            // ~50 ms — CP.L2.4 blackout window (12 V / 470 µF recovers by ~0.1 s).
            case "tran_forward_current_early_50ms" ->
                    readTranCurrentAtTime(simResult, spiceId, 0.05);
            default -> 0.0;
        };
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
