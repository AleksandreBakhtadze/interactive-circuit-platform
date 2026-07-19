package com.example.circuit_simulator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemListItemDTO {
    private Long id;
    private String code;
    private String title;
    private Integer displayOrder;
    /** True when the requesting user has solved this problem. */
    private boolean solved;
}
