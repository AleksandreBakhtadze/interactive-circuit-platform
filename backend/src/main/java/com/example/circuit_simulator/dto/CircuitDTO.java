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