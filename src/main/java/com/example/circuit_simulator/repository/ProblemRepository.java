package com.example.circuit_simulator.repository;

import com.example.circuit_simulator.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
}
