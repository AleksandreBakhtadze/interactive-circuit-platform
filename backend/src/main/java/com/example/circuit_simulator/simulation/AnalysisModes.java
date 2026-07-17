package com.example.circuit_simulator.simulation;

public final class AnalysisModes {

    private AnalysisModes() {}

    public static boolean usesTransient(String problemCode) {
        return "CP.L1.1".equals(problemCode)
                || "CP.L1.2".equals(problemCode)
                || "CP.L2.3".equals(problemCode)
                || "CP.L2.4".equals(problemCode);
    }

    /**
     * Charge .tran on button press (ICs from button-open DC).
     * CP.L1.2: soft RC turn-on from off.
     * CP.L2.4: uncharged cap paralleled across lit LED → instant dip, then slow recover.
     */
    public static boolean usesSlowCharge(String problemCode) {
        return "CP.L1.2".equals(problemCode) || "CP.L2.4".equals(problemCode);
    }

    /**
     * CP.L2.4: button parallels a discharged capacitor across the LED
     * (blackout then slow reclaim). Same backend phases as {@link #usesSlowCharge}.
     */
    public static boolean usesParallelCapDip(String problemCode) {
        return "CP.L2.4".equals(problemCode);
    }

    /**
     * CP.L2.3: SPDT slide switch crossfade — both LEDs charge/discharge slowly
     * when the slider toggles left ↔ right (ICs from the prior position).
     */
    public static boolean usesSwitchCrossfade(String problemCode) {
        return "CP.L2.3".equals(problemCode);
    }
}
