package com.example.circuit_simulator.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class CaseResultDTO {
    private String label;
    private String labelKa;
    private Map<String, String> switchStates;
    private boolean passed;
    private List<CheckResultDTO> checks;
}
