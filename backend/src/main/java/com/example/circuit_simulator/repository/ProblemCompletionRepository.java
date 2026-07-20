package com.example.circuit_simulator.repository;

import com.example.circuit_simulator.model.ProblemCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.time.LocalDateTime;

@Repository
public interface ProblemCompletionRepository extends JpaRepository<ProblemCompletion, Long> {

    Optional<ProblemCompletion> findByUserIdAndProblemId(Long userId, Long problemId);

    boolean existsByUserIdAndProblemId(Long userId, Long problemId);

    long countByUserId(Long userId);

    @Query("""
            SELECT COUNT(c) FROM ProblemCompletion c, Problem p
            WHERE c.problemId = p.id
              AND c.userId = :userId
              AND p.chapter.id = :chapterId
            """)
    long countByUserIdAndChapterId(
            @Param("userId") Long userId, @Param("chapterId") Long chapterId);

    @Query("""
            SELECT c.problemId FROM ProblemCompletion c
            WHERE c.userId = :userId AND c.problemId IN :problemIds
            """)
    Set<Long> findSolvedProblemIds(
            @Param("userId") Long userId, @Param("problemIds") List<Long> problemIds);

    @Query(value = """
            SELECT CAST(completed_at AS date) AS day, COUNT(*) AS cnt
            FROM problem_completions
            WHERE user_id = :userId AND completed_at >= :since
            GROUP BY CAST(completed_at AS date)
            ORDER BY day
            """, nativeQuery = true)
    List<Object[]> countGroupedByDaySince(
            @Param("userId") Long userId, @Param("since") LocalDateTime since);
}
