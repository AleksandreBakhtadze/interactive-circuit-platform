package com.example.circuit_simulator.simulation;

import java.util.Set;

/**
 * Scripted switch timeline for transient (.tran) simulation.
 */
public record TranScenario(
        double step,
        double stop,
        double pressStart,
        double pressEnd,
        Set<String> pulsedSwitchRoles,
        SwitchTimeline switchTimeline,
        String simPhaseLabel
) {
    public enum SwitchTimeline {
        /** Switches stay open for the full run (capacitor discharge). */
        OPEN,
        /** Switches stay closed for the full run (capacitor charge). */
        CLOSED,
        /** Switches keep the state already encoded in the JSON/netlist. */
        STATIC,
        /** Per-role PWL press/release window. */
        PULSED,
        /** Per-role square-wave taps (TCP.L3.5 capacitive base drive). */
        PERIODIC
    }

    public static TranScenario discharge() {
        return new TranScenario(0.005, 4.0, 0, 0, Set.of(), SwitchTimeline.OPEN, "discharge");
    }

    /**
     * DTR.L2.11 / L2.12 — multi-second button RC reclaim / fade; allow ~2–8 s window.
     */
    public static TranScenario delayedReclaimDischarge() {
        return new TranScenario(0.02, 8.0, 0, 0, Set.of(), SwitchTimeline.OPEN, "discharge");
    }

    /**
     * DTR.L2.12 — slow base-C charge on press; 8 s so ~2–5 s delayed-on still validates.
     */
    public static TranScenario delayedCharge() {
        return new TranScenario(0.02, 8.0, 0, 0, Set.of(), SwitchTimeline.CLOSED, "pressed");
    }

    /**
     * TCP.L1.x — 100 µF + 100 kΩ base bleed keeps the BJT on ~tens of seconds;
     * use a longer window so release fade / recovery is visible in validation.
     */
    public static TranScenario longHoldDischarge() {
        return new TranScenario(0.07, 35.0, 0, 0, Set.of(), SwitchTimeline.OPEN, "discharge");
    }

    public static TranScenario charge() {
        return new TranScenario(0.005, 4.0, 0, 0, Set.of(), SwitchTimeline.CLOSED, "pressed");
    }

    /**
     * TFB.L3.3 — short settle after a pot step with ICs from the prior wiper
     * position so positive-feedback latching can hold on/off across the snap.
     */
    public static TranScenario potSettle() {
        return new TranScenario(0.0005, 0.02, 0, 0, Set.of(), SwitchTimeline.CLOSED, "idle");
    }

    /** TFB.L3.4 — short settle after a button/switch state change, honoring JSON states. */
    public static TranScenario switchSettle() {
        return new TranScenario(0.0005, 0.02, 0, 0, Set.of(), SwitchTimeline.STATIC, "idle");
    }

    /**
     * TCP.L3.5 — rapid button taps (~5 Hz) so series-C base drive keeps the lamp lit.
     * pressStart = period (s), pressEnd = high-time (s).
     */
    public static TranScenario buttonTapTrain() {
        return new TranScenario(
                0.002,
                2.0,
                0.2,
                0.08,
                Set.of("button_1"),
                SwitchTimeline.PERIODIC,
                "tapping");
    }

    /**
     * TCP.L3.5 live press — short closed-button window so capacitive base coupling
     * flashes the lamp, then settles dark (not a 4 s RC charge).
     */
    public static TranScenario buttonEdgePress() {
        return new TranScenario(0.001, 0.5, 0, 0, Set.of(), SwitchTimeline.CLOSED, "pressed");
    }

    /**
     * TCP.L3.5 live release — short open-button window for the release edge pulse.
     */
    public static TranScenario buttonEdgeRelease() {
        return new TranScenario(0.001, 0.5, 0, 0, Set.of(), SwitchTimeline.OPEN, "discharge");
    }

    /**
     * CP.L2.3 Simulate: power-on from uncharged UIC with current slide position
     * (typically left → green branch charges).
     */
    public static TranScenario idlePowerOn() {
        return new TranScenario(0.005, 4.0, 0, 0, Set.of(), SwitchTimeline.CLOSED, "idle");
    }

    public boolean pulsesRole(String role) {
        return switchTimeline == SwitchTimeline.PULSED
                && role != null
                && pulsedSwitchRoles.contains(role);
    }

    public boolean periodicRole(String role) {
        return switchTimeline == SwitchTimeline.PERIODIC
                && role != null
                && pulsedSwitchRoles.contains(role);
    }
}
