package com.example.circuit_simulator.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "problems")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;        // e.g. "GEN.4", "GEN.5A"
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description; // problem statement in Georgian

    @Column(columnDefinition = "TEXT")
    private String hint;        // the help text

    private String difficulty;  // "beginner", "intermediate", "advanced"

    @ElementCollection
    private List<String> requiredComponents; // components the student must use
}