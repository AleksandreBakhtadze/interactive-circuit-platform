package com.example.circuit_simulator.repository;

import com.example.circuit_simulator.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findByCode(String code);
    List<Problem> findByDifficulty(String difficulty);

    @Query("""
            SELECT p FROM Problem p
            JOIN p.chapter c
            WHERE c.code = :chapterCode
            ORDER BY COALESCE(p.displayOrder, 999) ASC, p.code ASC
            """)
    List<Problem> findAllByChapterCode(@Param("chapterCode") String chapterCode);

    long countByChapterId(Long chapterId);
}