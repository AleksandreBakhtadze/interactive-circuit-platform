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
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + id));
    }

    public Problem getProblemByCode(String code) {
        return problemRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Problem not found with code: " + code));
    }

    public List<Problem> getProblemsByDifficulty(String difficulty) {
        return problemRepository.findByDifficulty(difficulty);
    }

    public Problem createProblem(Problem problem) {
        if (problemRepository.findByCode(problem.getCode()).isPresent()) {
            throw new RuntimeException("Problem with code " + problem.getCode() + " already exists");
        }
        return problemRepository.save(problem);
    }

    public Problem updateProblem(Long id, Problem updatedProblem) {
        Problem problem = getProblemById(id);
        problem.setTitle(updatedProblem.getTitle());
        problem.setDescription(updatedProblem.getDescription());
        problem.setHint(updatedProblem.getHint());
        problem.setDifficulty(updatedProblem.getDifficulty());
        problem.setRequiredComponents(updatedProblem.getRequiredComponents());
        return problemRepository.save(problem);
    }

    public void deleteProblem(Long id) {
        if (!problemRepository.existsById(id)) {
            throw new RuntimeException("Problem not found with id: " + id);
        }
        problemRepository.deleteById(id);
    }
}
