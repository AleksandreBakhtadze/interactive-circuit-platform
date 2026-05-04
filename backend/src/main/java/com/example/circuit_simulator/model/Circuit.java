package com.example.circuit_simulator.model;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import java.time.LocalDateTime;

@Entity
@Table(name = "circuits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Circuit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "problem_id")
    private Long problemId;

    @Column(name = "circuit_data", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private JsonNode circuitData;

    @Column(name = "simulation_results", columnDefinition = "jsonb")
    @Type(JsonType.class)
    private JsonNode simulationResults;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}