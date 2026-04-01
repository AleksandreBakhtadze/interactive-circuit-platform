package com.example.circuit_simulator.service;

import com.example.circuit_simulator.model.SimulationResult;
import com.example.circuit_simulator.repository.SimulationResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SimulationResultService {
    private final SimulationResultRepository simulationResultRepository;

    public List<SimulationResult> getAllResults() {
        return simulationResultRepository.findAll();
    }

    public SimulationResult getResultById(Long id) {
        return simulationResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Simulation result not found with id: " + id));
    }

    public List<SimulationResult> getResultsByCircuitId(Long circuitId) {
        return simulationResultRepository.findByCircuitId(circuitId);
    }

    public List<SimulationResult> getResultsByUserId(Long userId) {
        return simulationResultRepository.findByUserId(userId);
    }

    public SimulationResult createResult(SimulationResult result) {
        result.setCreatedAt(LocalDateTime.now());
        return simulationResultRepository.save(result);
    }

    public SimulationResult updateResult(Long id, SimulationResult updatedResult) {
        SimulationResult result = getResultById(id);
        result.setVoltageValues(updatedResult.getVoltageValues());
        result.setCurrentValues(updatedResult.getCurrentValues());
        result.setSimulationStatus(updatedResult.getSimulationStatus());
        result.setErrorMessage(updatedResult.getErrorMessage());
        result.setAnalysisReport(updatedResult.getAnalysisReport());
        result.setIsCorrect(updatedResult.getIsCorrect());
        return simulationResultRepository.save(result);
    }

    public void deleteResult(Long id) {
        if (!simulationResultRepository.existsById(id)) {
            throw new RuntimeException("Simulation result not found with id: " + id);
        }
        simulationResultRepository.deleteById(id);
    }
}