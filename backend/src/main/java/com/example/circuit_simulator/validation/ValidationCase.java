package com.example.circuit_simulator.validation;

import java.util.List;
import java.util.Map;

public record ValidationCase(
        String label,
        String labelKa,
        Map<String, String> switchStates,
        List<ValidationCheck> checks,
        String simPhase
) {
    /** DC steady-state case (default for ST problems). */
    public ValidationCase(
            String label,
            String labelKa,
            Map<String, String> switchStates,
            List<ValidationCheck> checks) {
        this(label, labelKa, switchStates, checks, null);
    }
}
