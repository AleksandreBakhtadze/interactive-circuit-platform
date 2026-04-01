package com.example.circuit_simulator.repository;

import com.example.circuit_simulator.model.SimulationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SimulationResultRepository extends JpaRepository<SimulationResult, Long> {
    List<SimulationResult> findByCircuitId(Long circuitId);
    List<SimulationResult> findByUserId(Long userId);
    List<SimulationResult> findByCircuitIdAndUserId(Long circuitId, Long userId);
}