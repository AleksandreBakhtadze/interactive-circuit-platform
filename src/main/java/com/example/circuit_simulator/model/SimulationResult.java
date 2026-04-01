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
@Table(name = "simulation_results")
public class SimulationResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long circuitId;

    @Column(nullable = false)
    private Long userId;

    @Column(columnDefinition = "jsonb")
    private String voltageValues;  // {node1: 5.0, node2: 3.3, ...}

    @Column(columnDefinition = "jsonb")
    private String currentValues;  // {component1: 0.5, component2: 0.3, ...}

    @Column(length = 50)
    private String simulationStatus;  // "success", "error", "warning"

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(columnDefinition = "TEXT")
    private String analysisReport;  // For marking the circuit

    private Boolean isCorrect;  // Did it match expected values?

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}