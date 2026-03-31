package com.example.circuit_simulator.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Problem problem;

    @Column(columnDefinition = "TEXT")
    private String circuitJson;  // the student's circuit as JSON

    @Column(columnDefinition = "TEXT")
    private String spiceNetlist; // converted to SPICE format

    @Column(columnDefinition = "TEXT")
    private String simulationResult; // raw ngspice output

    private boolean passed;          // did it meet the requirements?
    private LocalDateTime submittedAt;
}