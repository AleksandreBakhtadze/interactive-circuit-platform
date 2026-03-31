package com.example.circuit_simulator.service;

import com.example.circuit_simulator.model.Problem;
import com.example.circuit_simulator.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public Problem getProblemById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
    }

    public Problem createProblem(Problem problem) {
        return problemRepository.save(problem);
    }
}
