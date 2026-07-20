package com.example.circuit_simulator.validation;

import java.util.List;
import java.util.Map;

public record ValidationCase(
        String label,
        String labelKa,
        Map<String, String> switchStates,
        List<ValidationCheck> checks,
        String simPhase,
        Map<String, Double> potPositions,
        Map<String, Double> lightLevels
) {
    /** DC steady-state case (default for ST problems). */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks) {
        this(label, labelKa, switchStates, checks, null, Map.of(), Map.of());
    }

    /** Transient / phased case without pot overrides. */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks,
            String simPhase) {
        this(label, labelKa, switchStates, checks, simPhase, Map.of(), Map.of());
    }

    /** DC case with potentiometer wiper positions (role → 0..1). */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks,
            Map<String, Double> potPositions) {
        this(label, labelKa, switchStates, checks, null, potPositions, Map.of());
    }

    /** Transient case with potentiometer wiper positions. */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks,
            String simPhase,
            Map<String, Double> potPositions) {
        this(label, labelKa, switchStates, checks, simPhase, potPositions, Map.of());
    }
}
