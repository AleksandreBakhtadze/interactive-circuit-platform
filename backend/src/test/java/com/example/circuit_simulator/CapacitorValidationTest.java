package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CapacitorValidationTest {

    @Autowired
    private CircuitValidationService validationService;

    /** CP.L1.1 — hard charge path (instant LED on). */
    private static final String CP_L11_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","0"],"value":"3"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","E3"],"value":"3"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["E3","C5"],"value":"10u"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["C5","A7"],"state":"open"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["C5","C3"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["C3","E3"],"color":"red"}
              ]
            }
            """;

    /** CP.L1.2 — soft charge through series resistor. */
    private static final String CP_L12_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","0"],"value":"3"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","E3"],"value":"3"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["E3","C5"],"value":"10u"},
                {"id":"r_chg","role":"resistor_1","type":"resistor","nodes":["A7","C4"],"value":"10000"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["C4","C5"],"state":"open"},
                {"id":"r_led","role":"resistor_2","type":"resistor","nodes":["C5","C3"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["C3","E3"],"color":"red"}
              ]
            }
            """;

    /**
     * CP.L2.3 — SPDT: left (B) = green branch, right (C) = red branch.
     * Matches live workbench topology (series 12 V, charge R, dual RC LEDs).
     */
    private static final String CP_L23_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["B8","0"],"value":"3"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","G3"],"value":"3"},
                {"id":"cap_r","role":"capacitor_1","type":"capacitor","nodes":["G3","C5"],"value":"10u"},
                {"id":"cap_g","role":"capacitor_2","type":"capacitor","nodes":["G3","C3"],"value":"10u"},
                {"id":"led_r","role":"led_1","type":"led","nodes":["E5","G3"],"color":"red"},
                {"id":"led_g","role":"led_2","type":"led","nodes":["E4","G3"],"color":"green"},
                {"id":"r_r","role":"resistor_1","type":"resistor","nodes":["C5","E5"],"value":"1000"},
                {"id":"r_g","role":"resistor_2","type":"resistor","nodes":["C3","E4"],"value":"1000"},
                {"id":"sw","role":"slide_switch","type":"slide_switch","nodes":["B6","C3","C5"],"state":"left"},
                {"id":"r_chg","role":"resistor_3","type":"resistor","nodes":["B8","B6"],"value":"1000"}
              ]
            }
            """;

    @Test
    void cpL11ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L1.1", CP_L11_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL12ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L1.2", CP_L12_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL11CircuitFailsCpL12SlowChargeCase() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L1.2", CP_L11_CIRCUIT);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "slow_charge".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    @Test
    void cpL23ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L2.3", CP_L23_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL23FailsWhenGreenAndRedBranchesSwapped() throws Exception {
        // Swap throw pins: left now feeds red, so idle green-on case fails.
        String swapped = CP_L23_CIRCUIT.replace(
                "\"nodes\":[\"B6\",\"C3\",\"C5\"]",
                "\"nodes\":[\"B6\",\"C5\",\"C3\"]");

        ValidationResultDTO result = validationService.validate("CP.L2.3", swapped);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "slide_left_green_on".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    /**
     * CP.L2.4 — LED lit via series R; button parallels discharged C across LED;
     * bleed R across C.
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
    void cpL24ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L2.4", CP_L24_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    /**
     * Breadboard-style 2×6 V rails (12 V effective) — same topology as the
     * student photo; reclaim finishes near 0.1 s so early check must sample ~50 ms.
     */
    private static final String CP_L24_TWELVE_VOLT_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A6","0"],"value":"3"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","G3"],"value":"3"},
                {"id":"r_dis","role":"resistor_1","type":"resistor","nodes":["D4","G3"],"value":"10000"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["G3","D4"],"value":"470u"},
                {"id":"led1","role":"led_1","type":"led","nodes":["C6","G3"],"color":"red"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["D4","C6"],"state":"open"},
                {"id":"r_ser","role":"resistor_2","type":"resistor","nodes":["A6","C6"],"value":"1000"}
              ]
            }
            """;

    @Test
    void cpL24TwelveVoltBreadboardCircuitPassesValidation() throws Exception {
        ValidationResultDTO result =
                validationService.validate("CP.L2.4", CP_L24_TWELVE_VOLT_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL12CircuitFailsCpL24IdleLedOn() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L2.4", CP_L12_CIRCUIT);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "button_open".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    @Test
    void cpL24FailsWithoutCapacitorDip() throws Exception {
        // No capacitor — press cannot black out the LED.
        String noCap = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","MID"],"value":"3"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"3"},
                    {"id":"r_ser","role":"resistor_1","type":"resistor","nodes":["A7","C5"],"value":"1000"},
                    {"id":"led1","role":"led_1","type":"led","nodes":["C5","0"],"color":"red"},
                    {"id":"btn1","role":"button_1","type":"switch","nodes":["C5","C4"],"state":"open"},
                    {"id":"r_dis","role":"resistor_2","type":"resistor","nodes":["C4","0"],"value":"10000"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("CP.L2.4", noCap);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "press_dip_reclaim".equals(c.getLabel()))
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
