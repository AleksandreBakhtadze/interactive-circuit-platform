package com.example.circuit_simulator.simulation;

/**
 * Live-simulation phase for time-domain capacitor problems.
 * CP.L1.x / CP.L2.4: button idle / pressed / discharge.
 * CP.L2.3: slide switch idle (power-on .tran) / pressed (→right) / discharge (→left).
 */
public enum SimPhase {
    /**
     * CP.L1.x / CP.L2.4: button open DC.
     * CP.L2.3: Simulate — uncharged power-on transient at current slide position.
     */
    idle,
    /**
     * CP.L1.1: button closed DC; CP.L1.2 / CP.L2.4: charge transient;
     * CP.L2.3: slide switch just moved to right — crossfade from prior left ICs.
     */
    pressed,
    /**
     * CP.L1.x / CP.L2.4: button released discharge;
     * CP.L2.3: slide switch just moved to left — crossfade from prior right ICs.
     */
    discharge
}
