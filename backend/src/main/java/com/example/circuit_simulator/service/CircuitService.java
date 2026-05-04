package com.example.circuit_simulator.service;

import com.example.circuit_simulator.model.Circuit;
import com.example.circuit_simulator.repository.CircuitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CircuitService {
    private final CircuitRepository circuitRepository;

    public List<Circuit> getAllCircuits() {
        return circuitRepository.findAll();
    }

    public Circuit getCircuitById(Long id) {
        return circuitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Circuit not found with id: " + id));
    }

    public List<Circuit> getCircuitsByUserId(Long userId) {
        return circuitRepository.findByUserId(userId);
    }

    public List<Circuit> getCircuitsByProblemId(Long problemId) {
        return circuitRepository.findByProblemId(problemId);
    }

    public Circuit createCircuit(Circuit circuit) {
        circuit.setCreatedAt(LocalDateTime.now());
        circuit.setUpdatedAt(LocalDateTime.now());
        return circuitRepository.save(circuit);
    }

    public Circuit updateCircuit(Long id, Circuit updatedCircuit) {
        Circuit circuit = getCircuitById(id);
        circuit.setName(updatedCircuit.getName());
        circuit.setDescription(updatedCircuit.getDescription());
        circuit.setCircuitData(updatedCircuit.getCircuitData());
        circuit.setSimulationResults(updatedCircuit.getSimulationResults());
        circuit.setUpdatedAt(LocalDateTime.now());
        return circuitRepository.save(circuit);
    }

    public void deleteCircuit(Long id) {
        if (!circuitRepository.existsById(id)) {
            throw new RuntimeException("Circuit not found with id: " + id);
        }
        circuitRepository.deleteById(id);
    }
}
 