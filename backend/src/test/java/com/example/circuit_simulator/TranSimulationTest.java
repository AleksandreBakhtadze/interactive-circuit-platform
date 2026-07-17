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

    /** CP.L2.5: master SPST open at idle → dark DC; closed → green charge transient. */
    private static final String CP_L25_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","F7"],"value":"6"},
                {"id":"led_g","role":"led_1","type":"led","nodes":["A4","C4"],"color":"green"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["D5","F7"],"value":"470u"},
                {"id":"led_r","role":"led_2","type":"led","nodes":["E4","G4"],"color":"red"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["G4","F7"],"value":"5100"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["A4","A6"],"value":"5100"},
                {"id":"sw1","role":"switch","type":"switch","nodes":["A6","A8"],"state":"open"},
                {"id":"slide1","role":"slide_switch","type":"slide_switch","nodes":["D5","C4","E4"],"state":"left"}
              ]
            }
            """;

    @Test
    void cpL25IdleWithMasterOpenIsDcWithLedsOff() throws Exception {
        Map<String, Object> result = simulationService.simulateToMap(
                CP_L25_CIRCUIT, "CP.L2.5", "idle");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("dc", result.get("analysis"));

        @SuppressWarnings("unchecked")
        Map<String, Double> nodes = (Map<String, Double>) result.get("nodes");
        Double greenCurrent = nodes.get("@d_led_g[id]");
        Double redCurrent = nodes.get("@d_led_r[id]");
        assertNotNull(greenCurrent);
        assertNotNull(redCurrent);
        assertTrue(
                Math.abs(greenCurrent) < 1e-3,
                "Green LED should be off before master switch ON, was " + greenCurrent);
        assertTrue(
                Math.abs(redCurrent) < 1e-3,
                "Red LED should be off before master switch ON, was " + redCurrent);
    }

    @Test
    void cpL25IdleWithMasterClosedRunsGreenChargeTran() throws Exception {
        String closed = CP_L25_CIRCUIT.replace(
                "\"state\":\"open\"", "\"state\":\"closed\"");

        Map<String, Object> result = simulationService.simulateToMap(
                closed, "CP.L2.5", "idle");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("tran", result.get("analysis"));

        @SuppressWarnings("unchecked")
        Map<String, Object> components = (Map<String, Object>) result.get("components");
        @SuppressWarnings("unchecked")
        Map<String, Object> green = (Map<String, Object>) components.get("led_g");
        @SuppressWarnings("unchecked")
        List<Double> forwardCurrent = (List<Double>) green.get("forward_current");

        assertNotNull(forwardCurrent);
        assertFalse(forwardCurrent.isEmpty());
        assertTrue(
                forwardCurrent.get(0) > 1e-3,
                "Green LED should pulse when master switch is ON, was "
                        + forwardCurrent.get(0));
        assertTrue(
                forwardCurrent.get(0) > forwardCurrent.get(forwardCurrent.size() - 1),
                "Green LED should fade as cap charges");
    }

    @Test
    void cpL25PressedWithMasterOpenIsDcWithLedsOff() throws Exception {
        String slideRight = CP_L25_CIRCUIT.replace(
                "\"state\":\"left\"", "\"state\":\"right\"");

        Map<String, Object> result = simulationService.simulateToMap(
                slideRight, "CP.L2.5", "pressed");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("dc", result.get("analysis"));

        @SuppressWarnings("unchecked")
        Map<String, Double> nodes = (Map<String, Double>) result.get("nodes");
        Double greenCurrent = nodes.get("@d_led_g[id]");
        Double redCurrent = nodes.get("@d_led_r[id]");
        assertNotNull(greenCurrent);
        assertNotNull(redCurrent);
        assertTrue(
                Math.abs(greenCurrent) < 1e-3,
                "Green LED must stay off with master open, was " + greenCurrent);
        assertTrue(
                Math.abs(redCurrent) < 1e-3,
                "Red LED must stay off with master open (no phantom cap), was "
                        + redCurrent);
    }

    @Test
    void cpL27SlideCrossfadeShowsPriorLedThenOpposite() throws Exception {
        String circuitRight = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A2","0"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","E2"],"value":"6"},
                    {"id":"slide1","role":"slide_switch","type":"slide_switch","nodes":["D3","A2","E2"],"state":"right"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["D3","C5"],"value":"1000"},
                    {"id":"r2","role":"resistor_2","type":"resistor","nodes":["C5","F5"],"value":"1000"},
                    {"id":"led_r","role":"led_1","type":"led","nodes":["C5","C7"],"color":"red"},
                    {"id":"led_g","role":"led_2","type":"led","nodes":["C7","C5"],"color":"green"},
                    {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["C7","F5"],"value":"470u"},
                    {"id":"sw1","role":"switch","type":"switch","nodes":["C7","0"],"state":"closed"}
                  ]
                }
                """;

        String circuitLeft = circuitRight.replace(
                "\"nodes\":[\"D3\",\"A2\",\"E2\"],\"state\":\"right\"",
                "\"nodes\":[\"D3\",\"A2\",\"E2\"],\"state\":\"left\"");

        Map<String, Object> result = simulationService.simulateToMap(
                circuitLeft, "CP.L2.7", "discharge");

        assertFalse(result.containsKey("error"), String.valueOf(result.get("error")));
        assertEquals("tran", result.get("analysis"));

        @SuppressWarnings("unchecked")
        Map<String, Object> components = (Map<String, Object>) result.get("components");
        @SuppressWarnings("unchecked")
        Map<String, Object> green = (Map<String, Object>) components.get("led_g");
        @SuppressWarnings("unchecked")
        Map<String, Object> red = (Map<String, Object>) components.get("led_r");
        @SuppressWarnings("unchecked")
        List<Double> gI = (List<Double>) green.get("forward_current");
        @SuppressWarnings("unchecked")
        List<Double> rI = (List<Double>) red.get("forward_current");

        System.out.println("green[0]=" + gI.get(0)
                + " greenMax=" + gI.stream().mapToDouble(Double::doubleValue).max().orElse(0));
        System.out.println("red[0]=" + rI.get(0) + " redEnd=" + rI.get(rI.size() - 1));
        System.out.println("g20=" + gI.subList(0, Math.min(20, gI.size())));
        System.out.println("r20=" + rI.subList(0, Math.min(20, rI.size())));

        assertTrue(
                gI.get(0) > 5e-4,
                "Green should still be lit at start of flip from A–C, was " + gI.get(0));
        assertTrue(
                gI.get(0) > gI.get(Math.min(80, gI.size() - 1)),
                "Green should fade during polarity ramp");
        assertTrue(
                rI.get(rI.size() - 1) > 5e-4,
                "Red should be lit by end after flip to A–B, was " + rI.get(rI.size() - 1));
        assertTrue(
                rI.get(rI.size() - 1) > rI.get(0) + 5e-4,
                "Red should rise slowly after green fades");
    }
}
