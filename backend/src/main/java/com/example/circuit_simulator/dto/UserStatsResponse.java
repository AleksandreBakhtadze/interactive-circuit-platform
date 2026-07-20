package com.example.circuit_simulator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {
    private long solvedCount;
    private long totalCount;
    private List<UserBadgeDTO> badges;
    private List<UserActivityDayDTO> activity;
}
