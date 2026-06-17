package com.example.circuit_simulator.simulation;

/** Live-simulation phase for time-domain capacitor problems (CP.L1.x). */
public enum SimPhase {
    /** Button open — steady state, LED should be off. */
    idle,
    /** Button held closed — instant on (CP.L1.1 DC) or slow charge (CP.L1.2 tran). */
    pressed,
    /** Button just released — capacitor discharge transient. */
    discharge
}
