package com.example.circuit_simulator;

import com.example.circuit_simulator.service.SimulationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class TfbL25HysteresisProbeTest {

    @Autowired SimulationService simulationService;

    private static String circuit(double pot, String switchState) {
        return """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"%s"},
                    {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["WIPER","0","VCC"],"value":"10000","position":%s},
                    {"id":"rb","role":"resistor_1","type":"resistor","nodes":["WIPER","NBASE"],"value":"1000"},
                    {"id":"rpull","role":"resistor_2","type":"resistor","nodes":["VCC","NBASE2"],"value":"1000"},
                    {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","NBASE2","0"],"subtype":"npn"},
                    {"id":"ql","role":"transistor_2","type":"transistor","nodes":["NBASE2","LCOLL","0"],"subtype":"npn"},
                    {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","LCOLL"]}
                  ]
                }
                """.formatted(switchState, pot);
    }

    private double lampCurrent(String json, Map<String, Double> priorPot) throws Exception {
        var sim = simulationService.simulateToMap(json, "TFB.L2.5", null, priorPot);
        @SuppressWarnings("unchecked")
        var nodes = (Map<String, Double>) sim.get("nodes");
        for (var e : nodes.entrySet()) {
            if (e.getKey().toLowerCase().contains("lamp") && e.getKey().contains("[i]")) {
                return Math.abs(e.getValue());
            }
        }
        return 0.0;
    }

    @Test
    void hysteresisSnapBehavior() throws Exception {
        assertTrue(lampCurrent(circuit(0.0, "closed"), null) > 0.05, "on at low");
        assertTrue(
                lampCurrent(circuit(0.05, "closed"), Map.of("variable_resistor", 0.0)) > 0.05,
                "stay on rising");
        assertTrue(
                lampCurrent(circuit(0.5, "closed"), Map.of("variable_resistor", 0.0)) < 0.01,
                "snap off");
        assertTrue(
                lampCurrent(circuit(0.95, "closed"), Map.of("variable_resistor", 1.0)) < 0.01,
                "stay off falling");
        assertTrue(
                lampCurrent(circuit(0.0, "closed"), Map.of("variable_resistor", 1.0)) > 0.05,
                "snap on");
    }
}
