package com.example.circuit_simulator.simulation;

/** Live-simulation phase for time-domain problems (CP.L1.1). */
public enum SimPhase {
    /** Button open — steady state, LED should be off. */
    idle,
    /** Button held closed — steady charge path, LED on. */
    pressed,
    /** Button just released — capacitor discharge transient. */
    discharge
}
