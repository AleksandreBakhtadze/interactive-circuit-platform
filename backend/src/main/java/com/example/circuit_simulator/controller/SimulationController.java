package com.example.circuit_simulator.controller;

import com.example.circuit_simulator.service.SimulationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;
    private final ObjectMapper objectMapper;

    /**
     * Run ngspice on circuit JSON from the frontend board without persisting.
     * Body: { "components": [ { "id", "type", "nodes", ... } ] }
     */
    @PostMapping
    public Map<String, Object> simulate(@RequestBody Map<String, Object> circuit) throws Exception {
        String json = objectMapper.writeValueAsString(circuit);
        String result = simulationService.simulate(json);
        return objectMapper.readValue(result, Map.class);
    }
}
