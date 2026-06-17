package com.example.circuit_simulator.simulation;

/** One column exported via ngspice wrdata for transient results. */
public record TranProbe(
        String componentId,
        String metric,
        String wrdataExpression
) {}
