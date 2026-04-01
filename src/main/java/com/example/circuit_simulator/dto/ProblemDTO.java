package com.example.circuit_simulator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDTO {
    private Long id;
    private String code;
    private String title;
    private List<String> requiredComponents;
    private String description;
    private String hint;
    private String questions;
    private String methodology;
    private String difficulty;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}