package com.example.circuit_simulator.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "problems")
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;        // e.g. "GEN.4", "GEN.5A"

    @Column(nullable = false, length = 200)
    private String title;

    @ElementCollection
    @CollectionTable(
            name = "problem_required_components",
            joinColumns = @JoinColumn(name = "problem_id")
    )

    @Column(name = "component_name")
    private List<String> requiredComponents; // components the student must use

    @Column(columnDefinition = "TEXT")
    private String description; // problem statement in Georgian

    @Column(columnDefinition = "TEXT")
    private String hint;        // the help text

    @Column(columnDefinition = "TEXT")
    private String questions;

    @Column(columnDefinition = "TEXT")
    private String methodology;

    @Column(length = 50)
    private String difficulty;  // "beginner", "intermediate", "advanced"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
