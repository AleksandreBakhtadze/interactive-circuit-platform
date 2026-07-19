package com.example.circuit_simulator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterDTO {
    private Long id;
    private String code;
    private String titleKa;
    private String titleEn;
    private Integer displayOrder;
    private long problemCount;
    /** Solved by the requesting user; 0 when anonymous. */
    private long solvedCount;
}