package com.example.circuit_simulator.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "components")
public class Component {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;        // e.g. "Resistor 1K"
    private String type;        // "resistor", "capacitor", "transistor", etc.
    private String spiceModel;  // e.g. "R", "C", "NPN"
    private int pinCount;
    private String defaultValue; // e.g. "1000" for 1K resistor
}