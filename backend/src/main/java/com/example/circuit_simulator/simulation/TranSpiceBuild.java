package com.example.circuit_simulator.simulation;

import java.util.List;

public record TranSpiceBuild(
        String netlist,
        List<TranProbe> probes,
        TranScenario scenario
) {}
