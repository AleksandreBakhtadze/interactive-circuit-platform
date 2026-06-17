package com.example.circuit_simulator.simulation;

public final class AnalysisModes {

    private AnalysisModes() {}

    public static boolean usesTransient(String problemCode) {
        return "CP.L1.1".equals(problemCode) || "CP.L1.2".equals(problemCode);
    }

    /** CP.L1.2: slow LED turn-on while button is held (RC charge transient). */
    public static boolean usesSlowCharge(String problemCode) {
        return "CP.L1.2".equals(problemCode);
    }
}
