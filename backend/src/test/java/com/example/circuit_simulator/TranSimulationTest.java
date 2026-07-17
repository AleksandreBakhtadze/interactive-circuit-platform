package com.example.circuit_simulator;

import com.example.circuit_simulator.service.SimulationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class TranSimulationTest {

    @Autowired
    private SimulationService simulationService;

    /** Matches CP.L1.1 breadboard topology (series 12 V, cap on high rail, momentary tie to A7). */
    private static final String CP_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","E3"],"value":"6"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["E3","C5"],"value":"10u"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["C5","A7"],"state":"open"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["C5","C3"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["C3","E3"],"color":"red"}
              ]
            }
            """;

    @Test
    void cpL11IdleIsDcWithLedOff() throws Exception {
        Map<String, Object> result = simulationService.simulateToMap(
                CP_CIRCUIT, "CP.L1.1", "idle");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("dc", result.get("analysis"));

        @SuppressWarnings("unchecked")
        Map<String, Double> nodes = (Map<String, Double>) result.get("nodes");
        Double ledCurrent = nodes.get("@d_led1[id]");
        assertNotNull(ledCurrent);
        assertTrue(
                Math.abs(ledCurrent) < 1e-3,
                "LED should be off at idle (negligible forward current)");
    }

    @Test
    void cpL11PressedIsDcWithLedOn() throws Exception {
        String pressed = CP_CIRCUIT.replace("\"state\":\"open\"", "\"state\":\"closed\"");

        Map<String, Object> result = simulationService.simulateToMap(
                pressed, "CP.L1.1", "pressed");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("dc", result.get("analysis"));

        @SuppressWarnings("unchecked")
        Map<String, Double> nodes = (Map<String, Double>) result.get("nodes");
        Double ledCurrent = nodes.get("@d_led1[id]");
        assertNotNull(ledCurrent);
        assertTrue(
                Math.abs(ledCurrent) > 1e-3,
                "LED should conduct when button is pressed");
    }

    @Test
    void cpL11DischargeHasNonZeroForwardCurrent() throws Exception {
        Map<String, Object> result = simulationService.simulateToMap(
                CP_CIRCUIT, "CP.L1.1", "discharge");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("tran", result.get("analysis"));

        @SuppressWarnings("unchecked")
        Map<String, Object> components = (Map<String, Object>) result.get("components");
        @SuppressWarnings("unchecked")
        Map<String, Object> led = (Map<String, Object>) components.get("led1");
        @SuppressWarnings("unchecked")
        List<Double> forwardCurrent = (List<Double>) led.get("forward_current");

        assertNotNull(forwardCurrent);
        assertFalse(forwardCurrent.isEmpty());
        assertNull(led.get("voltage"), "LED voltage probe should not be exported");
        assertTrue(
                forwardCurrent.get(0) > 1e-3,
                "Discharge start should have >1 mA LED current, was "
                        + forwardCurrent.get(0));
    }

    @Test
    void cpL11DischargeRunsTransientWithDecay() throws Exception {
        String pressed = CP_CIRCUIT.replace("\"state\":\"open\"", "\"state\":\"closed\"");

        Map<String, Object> pressedResult = simulationService.simulateToMap(
                pressed, "CP.L1.1", "pressed");
        assertEquals("dc", pressedResult.get("analysis"));

        Map<String, Object> result = simulationService.simulateToMap(
                CP_CIRCUIT, "CP.L1.1", "discharge");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("tran", result.get("analysis"));

        @SuppressWarnings("unchecked")
        List<Double> time = (List<Double>) result.get("time");
        assertNotNull(time);
        assertTrue(time.size() > 10);

        @SuppressWarnings("unchecked")
        Map<String, Object> components = (Map<String, Object>) result.get("components");
        @SuppressWarnings("unchecked")
        Map<String, Object> led = (Map<String, Object>) components.get("led1");
        @SuppressWarnings("unchecked")
        List<Double> forwardCurrent = (List<Double>) led.get("forward_current");
        assertNotNull(forwardCurrent);
        assertTrue(
                forwardCurrent.get(0) > forwardCurrent.get(forwardCurrent.size() - 1),
                "LED forward current should decay during discharge");
    }

    /**
     * CP.L1.2: charge resistor in series with button (soft charge), LED+R on cap rail.
     */
    private static final String CP_L12_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","E3"],"value":"6"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["E3","C5"],"value":"10u"},
                {"id":"r_chg","role":"resistor_1","type":"resistor","nodes":["A7","C4"],"value":"10000"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["C4","C5"],"state":"open"},
                {"id":"r_led","role":"resistor_2","type":"resistor","nodes":["C5","C3"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["C3","E3"],"color":"red"}
              ]
            }
            """;

    @Test
    void cpL12IdleIsDcWithLedOff() throws Exception {
        Map<String, Object> result = simulationService.simulateToMap(
                CP_L12_CIRCUIT, "CP.L1.2", "idle");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("dc", result.get("analysis"));

        @SuppressWarnings("unchecked")
        Map<String, Double> nodes = (Map<String, Double>) result.get("nodes");
        Double ledCurrent = nodes.get("@d_led1[id]");
        assertNotNull(ledCurrent);
        assertTrue(Math.abs(ledCurrent) < 1e-3, "LED should be off at idle");
    }

    @Test
    void cpL12PressedIsChargeTransientWithRisingCurrent() throws Exception {
        Map<String, Object> result = simulationService.simulateToMap(
                CP_L12_CIRCUIT, "CP.L1.2", "pressed");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("tran", result.get("analysis"));
        assertEquals("pressed", result.get("simPhase"));

        @SuppressWarnings("unchecked")
        Map<String, Object> components = (Map<String, Object>) result.get("components");
        @SuppressWarnings("unchecked")
        Map<String, Object> led = (Map<String, Object>) components.get("led1");
        @SuppressWarnings("unchecked")
        List<Double> forwardCurrent = (List<Double>) led.get("forward_current");

        assertNotNull(forwardCurrent);
        assertTrue(forwardCurrent.size() > 10);
        assertTrue(
                forwardCurrent.get(forwardCurrent.size() - 1)
                        > forwardCurrent.get(0) + 1e-4,
                "LED current should rise during slow charge");
        assertTrue(
                forwardCurrent.get(0) < forwardCurrent.get(forwardCurrent.size() - 1) * 0.5,
                "LED should not be at full current at t=0 during charge");
    }

    /** Regression: pressed JSON carries state=closed; ICs must still be uncharged. */
    @Test
    void cpL12ChargeIgnoresClosedButtonInJsonForInitialConditions() throws Exception {
        String pressedJson = CP_L12_CIRCUIT.replace("\"state\":\"open\"", "\"state\":\"closed\"");

        Map<String, Object> result = simulationService.simulateToMap(
                pressedJson, "CP.L1.2", "pressed");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("tran", result.get("analysis"));

        @SuppressWarnings("unchecked")
        Map<String, Object> components = (Map<String, Object>) result.get("components");
        @SuppressWarnings("unchecked")
        Map<String, Object> led = (Map<String, Object>) components.get("led1");
        @SuppressWarnings("unchecked")
        List<Double> forwardCurrent = (List<Double>) led.get("forward_current");

        assertNotNull(forwardCurrent);
        double i0 = forwardCurrent.get(0);
        double iEnd = forwardCurrent.get(forwardCurrent.size() - 1);
        assertTrue(i0 < 1e-3, "First sample should be near zero, was " + i0);
        assertTrue(iEnd > i0 + 1e-4, "Current should rise from near-zero start");
    }

    @Test
    void cpL12DischargeRunsTransientWithDecay() throws Exception {
        Map<String, Object> result = simulationService.simulateToMap(
                CP_L12_CIRCUIT, "CP.L1.2", "discharge");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("tran", result.get("analysis"));
        assertEquals("discharge", result.get("simPhase"));

        @SuppressWarnings("unchecked")
        Map<String, Object> components = (Map<String, Object>) result.get("components");
        @SuppressWarnings("unchecked")
        Map<String, Object> led = (Map<String, Object>) components.get("led1");
        @SuppressWarnings("unchecked")
        List<Double> forwardCurrent = (List<Double>) led.get("forward_current");

        assertNotNull(forwardCurrent);
        assertTrue(forwardCurrent.size() > 10);
        assertTrue(
                forwardCurrent.get(0) > forwardCurrent.get(forwardCurrent.size() - 1),
                "LED forward current should decay during discharge");
    }

    /**
     * CP.L2.4: LED on through series R; button parallels discharged C across LED;
     * discharge R across C.
     */
    private static final String CP_L24_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","MID"],"value":"3"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"3"},
                {"id":"r_ser","role":"resistor_1","type":"resistor","nodes":["A7","C5"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["C5","0"],"color":"red"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["C5","C4"],"state":"open"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["C4","0"],"value":"470u"},
                {"id":"r_dis","role":"resistor_2","type":"resistor","nodes":["C4","0"],"value":"10000"}
              ]
            }
            """;

    @Test
    void cpL24IdleIsDcWithLedOn() throws Exception {
        Map<String, Object> result = simulationService.simulateToMap(
                CP_L24_CIRCUIT, "CP.L2.4", "idle");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("dc", result.get("analysis"));

        @SuppressWarnings("unchecked")
        Map<String, Double> nodes = (Map<String, Double>) result.get("nodes");
        Double ledCurrent = nodes.get("@d_led1[id]");
        assertNotNull(ledCurrent);
        assertTrue(
                Math.abs(ledCurrent) > 1e-3,
                "LED should be on at idle, was " + ledCurrent);
    }

    @Test
    void cpL24PressedDipsThenRecovers() throws Exception {
        Map<String, Object> result = simulationService.simulateToMap(
                CP_L24_CIRCUIT, "CP.L2.4", "pressed");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("tran", result.get("analysis"));
        assertEquals("pressed", result.get("simPhase"));

        @SuppressWarnings("unchecked")
        Map<String, Object> components = (Map<String, Object>) result.get("components");
        @SuppressWarnings("unchecked")
        Map<String, Object> led = (Map<String, Object>) components.get("led1");
        @SuppressWarnings("unchecked")
        List<Double> forwardCurrent = (List<Double>) led.get("forward_current");

        assertNotNull(forwardCurrent);
        assertTrue(forwardCurrent.size() > 10);

        double i0 = forwardCurrent.get(0);
        double iEnd = forwardCurrent.get(forwardCurrent.size() - 1);
        double iMin = forwardCurrent.stream().mapToDouble(Double::doubleValue).min().orElse(0);

        assertTrue(iEnd > 1e-3, "LED should recover by end of press, was " + iEnd);
        assertTrue(
                iMin < iEnd * 0.4,
                "Cap parallel should dip LED current (min=" + iMin + ", end=" + iEnd + ")");
        assertTrue(
                i0 < iEnd * 0.5 || iMin < i0 * 0.5,
                "Early samples should show blackout vs recovered brightness");
    }

    @Test
    void cpL24DischargeKeepsLedOn() throws Exception {
        Map<String, Object> result = simulationService.simulateToMap(
                CP_L24_CIRCUIT, "CP.L2.4", "discharge");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("tran", result.get("analysis"));
        assertEquals("discharge", result.get("simPhase"));

        @SuppressWarnings("unchecked")
        Map<String, Object> components = (Map<String, Object>) result.get("components");
        @SuppressWarnings("unchecked")
        Map<String, Object> led = (Map<String, Object>) components.get("led1");
        @SuppressWarnings("unchecked")
        List<Double> forwardCurrent = (List<Double>) led.get("forward_current");

        assertNotNull(forwardCurrent);
        double i0 = forwardCurrent.get(0);
        double iEnd = forwardCurrent.get(forwardCurrent.size() - 1);
        assertTrue(i0 > 1e-3, "LED should stay on at release start, was " + i0);
        assertTrue(iEnd > 1e-3, "LED should stay on at release end, was " + iEnd);
    }
}
