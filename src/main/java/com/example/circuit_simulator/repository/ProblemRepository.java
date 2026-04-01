package com.example.circuit_simulator.repository;

import com.example.circuit_simulator.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findByCode(String code);
    List<Problem> findByDifficulty(String difficulty);
}