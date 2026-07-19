package com.example.circuit_simulator.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "problem_completions",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_completion_user_problem",
                columnNames = {"user_id", "problem_id"}
        )
)
public class ProblemCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "problem_id", nullable = false)
    private Long problemId;

    @Column(name = "completed_at", nullable = false, updatable = false)
    private LocalDateTime completedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}
