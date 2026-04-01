package com.example.circuit_simulator.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "circuits")
public class Circuit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;  // Which user created this

    @Column(nullable = false, length = 200)
    private String name;  // e.g. "My First Circuit"

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long problemId;  // If solving a problem

    @Column(columnDefinition = "jsonb")
    private String circuitData;  // The actual circuit diagram as JSON
    // Format: {components: [...], connections: [...]}

    @Column(columnDefinition = "jsonb")
    private String simulationResults;  // Results from running the circuit

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}