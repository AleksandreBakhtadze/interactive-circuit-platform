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
        Set<String> pulsedSwitchRoles
) {
    public static TranScenario discharge() {
        return new TranScenario(0.005, 4.0, 0, 0, Set.of());
    }

    public boolean pulsesRole(String role) {
        return role != null && pulsedSwitchRoles.contains(role);
    }
}
