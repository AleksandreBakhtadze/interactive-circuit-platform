package com.example.circuit_simulator.dto;

import lombok.Data;

@Data
public class ValidateCircuitRequest {
    private String problemCode;
    /** JSON string: { "components": [ ... ] } */
    private String circuitData;
    /** Optional: when set and validation passes, mark this challenge solved. */
    private Long userId;
}
