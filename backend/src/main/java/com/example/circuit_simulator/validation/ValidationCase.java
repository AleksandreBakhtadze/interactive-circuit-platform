package com.example.circuit_simulator.validation;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ValidationCase(
        String label,
        String labelKa,
        Map<String, String> switchStates,
        List<ValidationCheck> checks,
        String simPhase,
        Map<String, Double> potPositions,
        Map<String, Double> lightLevels,
        Map<String, Double> priorPotPositions,
        Map<String, String> priorSwitchStates
) {
    public ValidationCase {
        switchStates = switchStates != null ? switchStates : Map.of();
        checks = checks != null ? checks : List.of();
        potPositions = potPositions != null ? potPositions : Map.of();
        lightLevels = lightLevels != null ? lightLevels : Map.of();
        priorPotPositions = priorPotPositions != null ? priorPotPositions : Map.of();
        priorSwitchStates = priorSwitchStates != null ? priorSwitchStates : Map.of();
    }

    /** DC steady-state case (default for ST problems). */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks) {
        this(label, labelKa, switchStates, checks, null, Map.of(), Map.of(), Map.of(), Map.of());
    }

    /** Transient / phased case without pot overrides. */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks,
            String simPhase) {
        this(label, labelKa, switchStates, checks, simPhase, Map.of(), Map.of(), Map.of(), Map.of());
    }

    /** DC case with potentiometer wiper positions (role → 0..1). */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks,
            Map<String, Double> potPositions) {
        this(label, labelKa, switchStates, checks, null, potPositions, Map.of(), Map.of(), Map.of());
    }

    /** Transient case with potentiometer wiper positions. */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks,
            String simPhase,
            Map<String, Double> potPositions) {
        this(label, labelKa, switchStates, checks, simPhase, potPositions, Map.of(), Map.of(), Map.of());
    }

    /** Case with pot and photoresistor light levels (no prior pot). */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks,
            String simPhase,
            Map<String, Double> potPositions,
            Map<String, Double> lightLevels) {
        this(
                label,
                labelKa,
                switchStates,
                checks,
                simPhase,
                potPositions,
                lightLevels != null ? lightLevels : Map.of(),
                Map.of(),
                Map.of());
    }

    /** DC / settle case with target pot and prior pot (hysteresis / latch). */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks,
            Map<String, Double> potPositions,
            Map<String, Double> priorPotPositions) {
        this(
                label,
                labelKa,
                switchStates,
                checks,
                null,
                potPositions,
                Map.of(),
                priorPotPositions != null ? priorPotPositions : Map.of(),
                Map.of());
    }
}
