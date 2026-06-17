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
        List<String> missingRoles = findMissingRoles(spec, roleToId);
        if (!missingRoles.isEmpty()) {
            return ValidationResultDTO.builder()
                    .passed(false)
                    .message("Missing parts on board: " + String.join(", ", missingRoles))
                    .messageKa("ფირზე აკლია: " + String.join(", ", missingRoles))
                    .cases(List.of())
                    .build();
        }

        List<CaseResultDTO> caseResults = new ArrayList<>();
        boolean allPassed = true;

        for (ValidationCase validationCase : spec.cases()) {
            String caseJson = SpiceGenerator.applySwitchStates(
                    circuitJson, validationCase.switchStates());
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
                String spiceId = roleToId.get(check.role());
                double actual = readMetric(
                        check.metric(), spiceId, componentVoltages, nodes, simResult);
                boolean checkPassed = compare(check.op(), actual, check.value());

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

        return ValidationResultDTO.builder()
                .passed(allPassed)
                .message(allPassed
                        ? "Correct! Your circuit behaves as required."
                        : "Not quite — check wiring and try again.")
                .messageKa(allPassed
                        ? "სწორია! თქვენი წრედი სწორად მუშაობს."
                        : "ჯერ არაა სწორი — შეამოწმეთ შეერთებები და სცადეთ კვლავ.")
                .cases(caseResults)
                .build();
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
            ProblemValidationSpec spec, Map<String, String> roleToId) {
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
            if (!roleToId.containsKey(role)) {
                missing.add(role);
            }
        }
        return missing;
    }

    private double readMetric(
            String metric,
            String spiceId,
            Map<String, Object> componentVoltages,
            Map<String, Double> nodes,
            Map<String, Object> simResult) {

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
            case "tran_forward_current_early" ->
                    readTranCurrentAtTime(simResult, spiceId, 0.1);
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

    private boolean compare(String op, double actual, double expected) {
        return switch (op) {
            case "gt" -> actual > expected;
            case "gte" -> actual >= expected;
            case "lt" -> actual < expected;
            case "lte" -> actual <= expected;
            case "eq" -> Math.abs(actual - expected) < 0.01;
            default -> false;
        };
    }
}
