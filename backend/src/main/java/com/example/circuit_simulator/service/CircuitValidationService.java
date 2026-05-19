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
            Map<String, Object> simResult = simulationService.simulateToMap(caseJson);

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
                        check.metric(), spiceId, componentVoltages, nodes);
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
            Map<String, Double> nodes) {

        if (spiceId == null) {
            return 0.0;
        }

        return switch (metric) {
            case "voltage" -> {
                Object v = componentVoltages.get(spiceId);
                yield v instanceof Number n ? Math.abs(n.doubleValue()) : 0.0;
            }
            case "current" -> {
                String key = "@r_" + spiceId.toLowerCase() + "[i]";
                Double i = nodes.get(key);
                yield i != null ? Math.abs(i) : 0.0;
            }
            default -> 0.0;
        };
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
