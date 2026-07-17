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
        /** Per-role PWL press/release window. */
        PULSED
    }

    public static TranScenario discharge() {
        return new TranScenario(0.005, 4.0, 0, 0, Set.of(), SwitchTimeline.OPEN, "discharge");
    }

    public static TranScenario charge() {
        return new TranScenario(0.005, 4.0, 0, 0, Set.of(), SwitchTimeline.CLOSED, "pressed");
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
}
