package com.example.circuit_simulator.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "chapters")
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code; // e.g. "ST", "LR", "TDM"

    @Column(nullable = false, length = 200)
    private String titleKa; // Georgian title

    @Column(nullable = false, length = 200)
    private String titleEn; // English title

    @Column(nullable = false)
    private Integer displayOrder;
}