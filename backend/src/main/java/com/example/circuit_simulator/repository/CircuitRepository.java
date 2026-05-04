package com.example.circuit_simulator.repository;

import com.example.circuit_simulator.model.Circuit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CircuitRepository extends JpaRepository<Circuit, Long> {
    List<Circuit> findByUserId(Long userId);
    List<Circuit> findByProblemId(Long problemId);
    List<Circuit> findByUserIdAndProblemId(Long userId, Long problemId);
}