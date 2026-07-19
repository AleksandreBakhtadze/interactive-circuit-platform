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
                || "CP.L2.7".equals(problemCode)
                || "CP.L2.8".equals(problemCode)
                || "CP.L2.9".equals(problemCode)
                || "CP.L2.12".equals(problemCode)
                || "CP.L2.13".equals(problemCode)
                || "CP.L2.14".equals(problemCode)
                || "CP.L2.15".equals(problemCode)
                || "CP.L2.16".equals(problemCode)
                || "CP.L4.19".equals(problemCode)
                || "DI.L3.6".equals(problemCode);
    }

    /**
     * DI.L3.6: pot stepped from bright → dim; capacitor hold uses ICs from the
     * prior (inverted) pot DC, then .tran at the new pot position.
     */
    public static boolean usesPotStepDischarge(String problemCode) {
        return "DI.L3.6".equals(problemCode);
    }

    /**
     * Charge .tran on button press (ICs from button-open DC).
     * CP.L1.2: soft RC turn-on from off.
     * CP.L2.4: uncharged cap paralleled across lit LED → instant dip, then slow recover.
     * CP.L2.13: soft-charge 470 µF; RGB LEDs light in Vf order (red→green→blue).
     * CP.L2.14: dim baseline LED; button soft-charges C so brightness rises gradually.
     * CP.L2.15: dual RC-LED branches; green must charge/discharge faster than red.
     */
    public static boolean usesSlowCharge(String problemCode) {
        return "CP.L1.2".equals(problemCode)
                || "CP.L2.4".equals(problemCode)
                || "CP.L2.13".equals(problemCode)
                || "CP.L2.14".equals(problemCode)
                || "CP.L2.15".equals(problemCode);
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
     * CP.L2.8: series motor + capacitor polarity pulses via SPDT.
     * CP.L2.9: full-voltage H-bridge polarity via two SPDTs.
     * CP.L2.12: series dual-cap + anti-parallel LEDs polarity via SPDT.
     * CP.L2.16: SPDT selects half vs full supply; RC softens LED brighten/fade.
     * CP.L4.19: dual SPDT voltage doubler — pulse series LEDs above supply V.
     */
    public static boolean usesSwitchCrossfade(String problemCode) {
        return "CP.L2.3".equals(problemCode)
                || "CP.L2.5".equals(problemCode)
                || "CP.L2.6".equals(problemCode)
                || "CP.L2.7".equals(problemCode)
                || "CP.L2.8".equals(problemCode)
                || "CP.L2.9".equals(problemCode)
                || "CP.L2.12".equals(problemCode)
                || "CP.L2.16".equals(problemCode)
                || "CP.L4.19".equals(problemCode);
    }

    /** Master SPST must be closed before power-on / slide / button transients. */
    public static boolean usesMasterSwitch(String problemCode) {
        return "CP.L2.5".equals(problemCode)
                || "CP.L2.6".equals(problemCode)
                || "CP.L2.7".equals(problemCode)
                || "CP.L2.12".equals(problemCode)
                || "CP.L2.14".equals(problemCode);
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
