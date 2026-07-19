package com.example.circuit_simulator;

import com.example.circuit_simulator.service.SimulationService;
import com.example.circuit_simulator.utils.SpiceGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DiL36SimReproTest {

    @Autowired
    private SimulationService simulationService;

    /** User board: PS2 shorted (both nodes ground) — reproduces ngspice 139. */
    private static final String USER_SHORTED_PS2 = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A6","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","0"],"value":"6"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["B5","0","A6"],"value":"10000","position":0.33},
                {"id":"d1","role":"diode_1","type":"led","nodes":["B5","B2"],"color":"plain"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["B5","D5"],"value":"1000"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["B2","D3"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["D5","0"],"color":"red"},
                {"id":"led2","role":"led_2","type":"led","nodes":["D3","0"],"color":"red"},
                {"id":"c1","role":"capacitor_1","type":"capacitor","nodes":["B2","0"],"value":"470u"}
              ]
            }
            """;

    /** Same topology with series supplies (12 V rail) — expected working board. */
    private static final String FIXED_SERIES = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["W","0","FULL"],"value":"10000","position":0.33},
                {"id":"d1","role":"diode_1","type":"led","nodes":["W","HOLD"],"color":"plain"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["W","A1"],"value":"1000"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["HOLD","A2"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["A1","0"],"color":"red"},
                {"id":"led2","role":"led_2","type":"led","nodes":["A2","0"],"color":"red"},
                {"id":"c1","role":"capacitor_1","type":"capacitor","nodes":["HOLD","0"],"value":"470u"}
              ]
            }
            """;

    @Test
    void printSpiceForShortedPs2() throws Exception {
        // Keep as a readable fixture dump when debugging ngspice 139.
        assertTrue(SpiceGenerator.generateSpice(USER_SHORTED_PS2).contains("skipped shorted"));
    }

    @Test
    void shortedPs2IdleAndDischargeWorkAfterSkip() throws Exception {
        Map<String, Object> idle =
                simulationService.simulateToMap(USER_SHORTED_PS2, "DI.L3.6", "idle");
        System.out.println("shorted idle=" + idle.keySet() + " err=" + idle.get("error"));
        assertFalse(idle.containsKey("error"), String.valueOf(idle.get("error")));
        assertEquals("dc", idle.get("analysis"));

        Map<String, Object> discharge =
                simulationService.simulateToMap(USER_SHORTED_PS2, "DI.L3.6", "discharge");
        System.out.println(
                "shorted discharge=" + discharge.keySet() + " err=" + discharge.get("error"));
        assertFalse(discharge.containsKey("error"), String.valueOf(discharge.get("error")));
        assertEquals("tran", discharge.get("analysis"));
    }

    @Test
    void bothSuppliesShortedReturnsClearError() throws Exception {
        String bothShorted =
                USER_SHORTED_PS2.replace(
                        "\"nodes\":[\"A6\",\"0\"]", "\"nodes\":[\"0\",\"0\"]");
        Map<String, Object> result =
                simulationService.simulateToMap(bothShorted, "DI.L3.6", "idle");
        assertTrue(result.containsKey("error"));
        assertTrue(
                String.valueOf(result.get("error")).toLowerCase().contains("shorted")
                        || String.valueOf(result.get("error")).toLowerCase().contains("series"));
        assertFalse(String.valueOf(result.get("error")).contains("139"));
    }

    @Test
    void fixedSeriesIdleWorks() throws Exception {
        Map<String, Object> result =
                simulationService.simulateToMap(FIXED_SERIES, "DI.L3.6", "idle");
        System.out.println("fixed idle=" + result.keySet() + " err=" + result.get("error"));
        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("dc", result.get("analysis"));
    }

    @Test
    void priorPotDischargeDoesNotJumpToOppositeExtreme() throws Exception {
        // Mid → slightly dimmer: ICs from mid, not from inverted bright extreme.
        String atDim =
                FIXED_SERIES.replace("\"position\":0.33", "\"position\":0.7");
        Map<String, Object> withPrior =
                simulationService.simulateToMap(
                        atDim,
                        "DI.L3.6",
                        "discharge",
                        Map.of("variable_resistor", 0.33));
        assertFalse(withPrior.containsKey("error"), String.valueOf(withPrior.get("error")));
        assertEquals("tran", withPrior.get("analysis"));
    }
}
