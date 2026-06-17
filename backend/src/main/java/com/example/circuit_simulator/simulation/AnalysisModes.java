package com.example.circuit_simulator.simulation;

public final class AnalysisModes {

    private AnalysisModes() {}

    public static boolean usesTransient(String problemCode) {
        return "CP.L1.1".equals(problemCode);
    }
}
