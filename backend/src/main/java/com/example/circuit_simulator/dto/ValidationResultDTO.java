package com.example.circuit_simulator.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ValidationResultDTO {
    private boolean passed;
    private String message;
    private String messageKa;
    private List<CaseResultDTO> cases;
    /** True when this pass was recorded (or already existed) for the user. */
    private boolean solved;
}
