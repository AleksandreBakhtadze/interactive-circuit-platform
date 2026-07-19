package com.example.circuit_simulator.service;

import com.example.circuit_simulator.model.Problem;
import com.example.circuit_simulator.model.ProblemCompletion;
import com.example.circuit_simulator.repository.ProblemCompletionRepository;
import com.example.circuit_simulator.repository.ProblemRepository;
import com.example.circuit_simulator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProblemCompletionService {

    private final ProblemCompletionRepository completionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    /**
     * Idempotent: records a solve the first time; returns true if the user has
     * this problem marked solved after the call (including prior solves).
     */
    @Transactional
    public boolean markSolved(Long userId, String problemCode) {
        if (userId == null || problemCode == null || problemCode.isBlank()) {
            return false;
        }
        if (!userRepository.existsById(userId)) {
            return false;
        }

        Problem problem = problemRepository.findByCode(problemCode.trim())
                .orElse(null);
        if (problem == null) {
            return false;
        }

        if (!completionRepository.existsByUserIdAndProblemId(userId, problem.getId())) {
            completionRepository.save(
                    ProblemCompletion.builder()
                            .userId(userId)
                            .problemId(problem.getId())
                            .build());
        }
        return true;
    }

    public long countSolvedInChapter(Long userId, Long chapterId) {
        if (userId == null || chapterId == null) {
            return 0;
        }
        return completionRepository.countByUserIdAndChapterId(userId, chapterId);
    }

    public Set<Long> findSolvedProblemIds(Long userId, List<Long> problemIds) {
        if (userId == null || problemIds == null || problemIds.isEmpty()) {
            return Collections.emptySet();
        }
        return completionRepository.findSolvedProblemIds(userId, problemIds);
    }
}
