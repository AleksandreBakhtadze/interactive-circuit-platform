package com.example.circuit_simulator.validation;

import java.util.List;

public record ProblemValidationSpec(
        String problemCode,
        List<ValidationCase> cases
) {}
