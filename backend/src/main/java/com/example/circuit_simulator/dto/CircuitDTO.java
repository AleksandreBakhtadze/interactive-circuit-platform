package com.example.circuit_simulator.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

@Data
public class CircuitDTO {
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private Long problemId;
    /** Problem code (e.g. CP.L1.1) — selects DC vs transient analysis. */
    private String problemCode;
    /** Live phase for CP transient problems: idle | pressed | discharge. */
    private String simPhase;
    /**
     * DI.L3.6 live pot fade: wiper positions (by role) for the DC state before the
     * step — ICs for .tran. When null, pot-step discharge uses inverted extremes
     * (validation).
     */
    private java.util.Map<String, Double> priorPotPositions;
    private String circuitData;  // Keep as String for JSON input
    private String simulationResults;

    // Helper to convert string to JsonNode
    public JsonNode getCircuitDataAsJson() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readTree(circuitData);
    }

    public JsonNode getSimulationResultsAsJson() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readTree(simulationResults);
    }
}