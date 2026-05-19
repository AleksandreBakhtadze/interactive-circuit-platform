package com.example.circuit_simulator.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckResultDTO {
    private String role;
    private String metric;
    private String op;
    private double expected;
    private double actual;
    private boolean passed;
}
