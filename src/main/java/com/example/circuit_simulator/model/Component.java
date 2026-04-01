package com.example.circuit_simulator.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "components")
public class Component {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String type;  // "resistor", "capacitor", "inductor", "battery", "led", etc.

    @Column(columnDefinition = "TEXT")
    private String spiceModel;  // SPICE model definition

    @Column(nullable = false)
    private int pinCount;

    // Instance name used in SPICE netlist (very important!)
    @Column(nullable = false, length = 30)
    private String instanceName;  // e.g. "R1", "LED_red_2", "SW_button1", "W_wire3"

    // Full ready-to-use SPICE line for ngspice
    @Column(columnDefinition = "TEXT")
    private String spiceDefinition;   // e.g. "R1 n3 n4 1000" or "Vsupply n1 0 DC 3"

    @Column(length = 100)
    private String defaultValue;  // e.g. "1k" for resistor, "5V" for battery
}
