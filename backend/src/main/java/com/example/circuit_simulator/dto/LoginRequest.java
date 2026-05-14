package com.example.circuit_simulator.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String identifier;
    private String password;
}