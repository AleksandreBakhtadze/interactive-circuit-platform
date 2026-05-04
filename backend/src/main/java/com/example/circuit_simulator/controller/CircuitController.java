package com.example.circuit_simulator.controller;

import com.example.circuit_simulator.dto.CircuitDTO;
import com.example.circuit_simulator.model.Circuit;
import com.example.circuit_simulator.service.CircuitService;
import com.example.circuit_simulator.service.SimulationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/circuits")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CircuitController {
    private final CircuitService circuitService;
    private final SimulationService simulationService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<Circuit> getAll() {
        return circuitService.getAllCircuits();
    }

    @PostMapping
    public Circuit create(@RequestBody Circuit circuit) {
        return circuitService.createCircuit(circuit);
    }

    @PostMapping("/simulate")
    public Circuit simulate(@RequestBody CircuitDTO dto) throws Exception {
        // Run simulation
        String result = simulationService.simulate(dto.getCircuitData());

        // Create circuit entity
        Circuit circuit = Circuit.builder()
                .userId(dto.getUserId())
                .name(dto.getName())
                .description(dto.getDescription())
                .problemId(dto.getProblemId())
                .circuitData(objectMapper.readTree(dto.getCircuitData()))
                .simulationResults(objectMapper.readTree(result))
                .build();

        return circuitService.createCircuit(circuit);
    }

    @GetMapping("/{id}")
    public Circuit getById(@PathVariable Long id) {
        return circuitService.getCircuitById(id);
    }

    @PutMapping("/{id}")
    public Circuit update(@PathVariable Long id, @RequestBody Circuit circuit) {
        return circuitService.updateCircuit(id, circuit);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        circuitService.deleteCircuit(id);
    }
}