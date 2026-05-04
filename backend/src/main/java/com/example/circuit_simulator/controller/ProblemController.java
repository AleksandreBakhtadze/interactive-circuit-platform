package com.example.circuit_simulator.controller;

import com.example.circuit_simulator.model.Problem;
import com.example.circuit_simulator.service.ProblemService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.circuit_simulator.dto.ProblemDTO;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public List<ProblemDTO> getAllProblems() {
        return problemService.getAllProblems().stream()
                .map(this::convertToDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ProblemDTO getProblem(@PathVariable Long id) {
        Problem problem = problemService.getProblemById(id);
        return convertToDTO(problem);
    }

    private ProblemDTO convertToDTO(Problem problem) {
        ProblemDTO dto = new ProblemDTO();
        dto.setId(problem.getId());
        dto.setCode(problem.getCode());
        dto.setTitle(problem.getTitle());
        dto.setRequiredComponents(problem.getRequiredComponents());
        dto.setDescription(problem.getDescription());
        dto.setHint(problem.getHint());
        dto.setQuestions(problem.getQuestions());
        dto.setMethodology(problem.getMethodology());
        dto.setDifficulty(problem.getDifficulty());
        dto.setCreatedAt(problem.getCreatedAt());
        dto.setUpdatedAt(problem.getUpdatedAt());
        return dto;
    }

    @PostMapping
    public ProblemDTO createProblem(@RequestBody Problem problem) {
        Problem saved = problemService.createProblem(problem);
        return convertToDTO(saved);
    }
}
