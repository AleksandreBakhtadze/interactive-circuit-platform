package com.example.circuit_simulator.validation;

public record ValidationCheck(
        String role,
        String metric,
        String op,
        double value
) {}
