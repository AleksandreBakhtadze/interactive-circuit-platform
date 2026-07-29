package com.example.circuit_simulator.service;

import com.example.circuit_simulator.dto.ProblemDTO;
import com.example.circuit_simulator.dto.ProblemListItemDTO;
import com.example.circuit_simulator.model.Problem;
import com.example.circuit_simulator.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProblemService {
    private static final Set<String> HIDDEN_PROBLEM_CODES = Set.of("ST.L1.6", "ST.L1.7");

    private final ProblemRepository problemRepository;
    private final ProblemCompletionService completionService;

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

    public Problem getProblemByChapterAndSlug(String chapterCode, String slug) {
        String problemCode = chapterCode.toUpperCase() + "." + slug;
        if (HIDDEN_PROBLEM_CODES.contains(problemCode.toUpperCase())) {
            throw new RuntimeException("Problem not found with code: " + problemCode);
        }
        return getProblemByCode(problemCode);
    }

    public ProblemDTO getProblemDtoByChapterAndSlug(String chapterCode, String slug) {
        return toDto(getProblemByChapterAndSlug(chapterCode, slug));
    }

    public ProblemDTO toDto(Problem problem) {
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

    public List<Problem> getProblemsByDifficulty(String difficulty) {
        return problemRepository.findByDifficulty(difficulty);
    }

    public List<ProblemListItemDTO> getProblemListByChapterCode(String chapterCode) {
        return getProblemListByChapterCode(chapterCode, null);
    }

    public List<ProblemListItemDTO> getProblemListByChapterCode(
            String chapterCode, Long userId) {
        List<Problem> problems =
                problemRepository.findAllByChapterCode(chapterCode.toUpperCase())
                        .stream()
                        .filter(p -> !HIDDEN_PROBLEM_CODES.contains(p.getCode().toUpperCase()))
                        .toList();
        Set<Long> solvedIds = userId == null
                ? Collections.emptySet()
                : completionService.findSolvedProblemIds(
                        userId,
                        problems.stream().map(Problem::getId).toList());

        return problems.stream()
                .map(p -> new ProblemListItemDTO(
                        p.getId(),
                        p.getCode(),
                        p.getTitle(),
                        p.getDisplayOrder(),
                        solvedIds.contains(p.getId())
                ))
                .toList();
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
