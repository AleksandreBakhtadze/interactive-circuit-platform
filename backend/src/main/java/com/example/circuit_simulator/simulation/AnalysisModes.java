package com.example.circuit_simulator.simulation;

public final class AnalysisModes {

    private AnalysisModes() {}

    public static boolean usesTransient(String problemCode) {
        return "CP.L1.1".equals(problemCode)
                || "CP.L1.2".equals(problemCode)
                || "CP.L2.3".equals(problemCode)
                || "CP.L2.4".equals(problemCode)
                || "CP.L2.5".equals(problemCode)
                || "CP.L2.6".equals(problemCode)
                || "CP.L2.7".equals(problemCode);
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
     * CP.L2.3: dual-cap SPDT crossfade.
     * CP.L2.5 / CP.L2.6: series-cap polarity pulses via SPDT.
     * CP.L2.7: parallel-cap polarity crossfade via SPDT.
     */
    public static boolean usesSwitchCrossfade(String problemCode) {
        return "CP.L2.3".equals(problemCode)
                || "CP.L2.5".equals(problemCode)
                || "CP.L2.6".equals(problemCode)
                || "CP.L2.7".equals(problemCode);
    }

    /** Master SPST must be closed before power-on / slide transients run. */
    public static boolean usesMasterSwitch(String problemCode) {
        return "CP.L2.5".equals(problemCode)
                || "CP.L2.6".equals(problemCode)
                || "CP.L2.7".equals(problemCode);
    }

    /**
     * CP.L2.7: opening the master SPST discharges the parallel capacitor through
     * the last-lit LED (slow fade), instead of jumping to dark DC.
     */
    public static boolean usesMasterOffDischarge(String problemCode) {
        return "CP.L2.7".equals(problemCode);
    }

    /**
     * CP.L2.7: parallel-cap polarity flip — drive slide common with a slow PWL
     * so LEDs fade/rise with capacitor recharge (instant SPDT reconnect fights ICs).
     */
    public static boolean usesParallelCapPolarity(String problemCode) {
        return "CP.L2.7".equals(problemCode);
    }
}
