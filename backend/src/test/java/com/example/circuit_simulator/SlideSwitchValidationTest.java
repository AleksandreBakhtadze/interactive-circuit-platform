package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SlideSwitchValidationTest {

    @Autowired
    private CircuitValidationService validationService;

    /**
     * SW.L1.1 — preferred single-R topology (SW.1B): R before SPDT common;
     * B → LED1, C → LED2; shared return to ground.
     */
    private static final String SW_L11_ONE_R = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["A8","COM"],"value":"1000"},
                {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["COM","L1","L2"],"state":"left"},
                {"id":"led1","role":"led_1","type":"led","nodes":["L1","0"],"color":"red"},
                {"id":"led2","role":"led_2","type":"led","nodes":["L2","0"],"color":"red"}
              ]
            }
            """;

    /** SW.L1.1 — dual branch resistors (SW.1A). */
    private static final String SW_L11_TWO_R = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["A8","B1","C1"],"state":"left"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["B1","L1"],"value":"1000"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["C1","L2"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["L1","0"],"color":"red"},
                {"id":"led2","role":"led_2","type":"led","nodes":["L2","0"],"color":"red"}
              ]
            }
            """;

    @Test
    void swL11SingleResistorCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("SW.L1.1", SW_L11_ONE_R);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(2, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void swL11DualResistorCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("SW.L1.1", SW_L11_TWO_R);

        assertTrue(result.isPassed(), describeFailures(result));
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void swL11FailsWhenOnlyOneLedWired() throws Exception {
        String oneLed = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["A8","COM"],"value":"1000"},
                    {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["COM","L1","L2"],"state":"left"},
                    {"id":"led1","role":"led_1","type":"led","nodes":["L1","0"],"color":"red"},
                    {"id":"led2","role":"led_2","type":"led","nodes":["X9","0"],"color":"red"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("SW.L1.1", oneLed);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "slide_right_other_led".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    /**
     * SW.L1.2 — left (B) = 5.1 kΩ dim, right (C) = 1 kΩ bright; shared LED.
     */
    private static final String SW_L12_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["A8","DIM","BRT"],"state":"left"},
                {"id":"r_dim","role":"resistor_1","type":"resistor","nodes":["DIM","LEDA"],"value":"5100"},
                {"id":"r_brt","role":"resistor_2","type":"resistor","nodes":["BRT","LEDA"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["LEDA","0"],"color":"red"}
              ]
            }
            """;

    @Test
    void swL12ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("SW.L1.2", SW_L12_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(2, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void swL12SwappedResistorsAlsoPass() throws Exception {
        // Photo-style: left = 1 kΩ (bright), right = 5.1 kΩ (dim).
        String swapped = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["A8","BRT","DIM"],"state":"left"},
                    {"id":"r_brt","role":"resistor_1","type":"resistor","nodes":["BRT","LEDA"],"value":"1000"},
                    {"id":"r_dim","role":"resistor_2","type":"resistor","nodes":["DIM","LEDA"],"value":"5100"},
                    {"id":"led1","role":"led_1","type":"led","nodes":["LEDA","0"],"color":"red"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("SW.L1.2", swapped);

        assertTrue(result.isPassed(), describeFailures(result));
    }

    @Test
    void swL12FiveOneVsTenKPasses() throws Exception {
        String circuit = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["A8","A","B"],"state":"left"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["A","LEDA"],"value":"5100"},
                    {"id":"r2","role":"resistor_2","type":"resistor","nodes":["B","LEDA"],"value":"10000"},
                    {"id":"led1","role":"led_1","type":"led","nodes":["LEDA","0"],"color":"red"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("SW.L1.2", circuit);

        assertTrue(result.isPassed(), describeFailures(result));
    }

    @Test
    void swL12FailsWhenResistorsEqual() throws Exception {
        String equalR = SW_L12_CIRCUIT.replace(
                "\"value\":\"5100\"", "\"value\":\"1000\"");

        ValidationResultDTO result = validationService.validate("SW.L1.2", equalR);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "slide_right_different_brightness".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    @Test
    void swL12FailsWhenResistorsTooHigh() throws Exception {
        String highR = SW_L12_CIRCUIT
                .replace("\"value\":\"5100\"", "\"value\":\"100000\"")
                .replace("\"value\":\"1000\"", "\"value\":\"510000\"");

        ValidationResultDTO result = validationService.validate("SW.L1.2", highR);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "slide_left_lit".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    /**
     * SW.L2.3 — single 1 kΩ; left = mid-tap (half V), right = full rail.
     */
    private static final String SW_L23_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["COM","MID","FULL"],"state":"left"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["COM","LEDA"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["LEDA","0"],"color":"red"}
              ]
            }
            """;

    @Test
    void swL23ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("SW.L2.3", SW_L23_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(2, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void swL23FailsWhenBothThrowsOnFullRail() throws Exception {
        // No mid-tap: both throws tied to full → same brightness.
        String noMid = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["COM","FULL","FULL"],"state":"left"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["COM","LEDA"],"value":"1000"},
                    {"id":"led1","role":"led_1","type":"led","nodes":["LEDA","0"],"color":"red"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("SW.L2.3", noMid);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "slide_right_bright".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    /**
     * SW.L2.4 — lamp; left = mid-tap (half V), right = full rail.
     */
    private static final String SW_L24_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["COM","MID","FULL"],"state":"left"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["COM","0"]}
              ]
            }
            """;

    @Test
    void swL24ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("SW.L2.4", SW_L24_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(2, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void swL24FailsWhenBothThrowsOnFullRail() throws Exception {
        String noMid = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["COM","FULL","FULL"],"state":"left"},
                    {"id":"lamp","role":"lamp","type":"lamp","nodes":["COM","0"]}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("SW.L2.4", noMid);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "slide_right_bright".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    /**
     * SW.L2.5 — 20 Ω in series on left (dim), bypass on right (bright); full rail only.
     */
    private static final String SW_L25_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["FULL","DIM"],"value":"20"},
                {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["COM","DIM","FULL"],"state":"left"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["COM","0"]}
              ]
            }
            """;

    @Test
    void swL25ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("SW.L2.5", SW_L25_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(2, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void swL25SwappedThrowsAlsoPass() throws Exception {
        // Bypass on left, series R on right — same topology, opposite throw assignment.
        String swapped = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["FULL","DIM"],"value":"20"},
                    {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["COM","FULL","DIM"],"state":"left"},
                    {"id":"lamp","role":"lamp","type":"lamp","nodes":["COM","0"]}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("SW.L2.5", swapped);

        assertTrue(result.isPassed(), describeFailures(result));
    }

    @Test
    void swL25FailsWhenUsingMidTapOnly() throws Exception {
        // L2.4 topology without series R — current too low for this task.
        String midTap = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["COM","MID","FULL"],"state":"left"},
                    {"id":"lamp","role":"lamp","type":"lamp","nodes":["COM","0"]}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("SW.L2.5", midTap);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "slide_left".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    private static String describeFailures(ValidationResultDTO result) {
        if (result.isPassed()) {
            return "";
        }
        StringBuilder sb = new StringBuilder(result.getMessage());
        for (var c : result.getCases()) {
            if (!c.isPassed()) {
                sb.append(" | case ").append(c.getLabel());
                for (var check : c.getChecks()) {
                    if (!check.isPassed()) {
                        sb.append(" [")
                                .append(check.getMetric())
                                .append(' ')
                                .append(check.getOp())
                                .append(' ')
                                .append(check.getExpected())
                                .append(" actual=")
                                .append(check.getActual())
                                .append(']');
                    }
                }
            }
        }
        return sb.toString();
    }
}
