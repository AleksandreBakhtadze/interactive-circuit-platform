package com.example.circuit_simulator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterDetailDTO {
    private ChapterDTO chapter;
    private List<ProblemListItemDTO> problems;
}
