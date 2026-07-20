package com.example.circuit_simulator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserActivityDayDTO {
    private String date;
    private long count;
}
