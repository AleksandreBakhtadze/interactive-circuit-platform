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
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","E3"],"value":"6"},
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

    /**
     * CP.L2.3 — SPDT: left (B) = green branch, right (C) = red branch.
     * Matches live workbench topology (series 12 V, charge R, dual RC LEDs).
     */
    private static final String CP_L23_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["B8","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","G3"],"value":"6"},
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
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A6","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","G3"],"value":"6"},
                {"id":"r_dis","role":"resistor_1","type":"resistor","nodes":["D4","G3"],"value":"10000"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["G3","D4"],"value":"470u"},
                {"id":"led1","role":"led_1","type":"led","nodes":["C6","G3"],"color":"red"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["D4","C6"],"state":"open"},
                {"id":"r_ser","role":"resistor_2","type":"resistor","nodes":["A6","C6"],"value":"1000"}
              ]
            }
            """;

    /**
     * CP.L2.8 — dual ±6 V rails, SPDT polarity, series motor + 470 µF to mid-rail.
     */
    private static final String CP_L28_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A3","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","E3"],"value":"6"},
                {"id":"slide1","role":"slide_switch","type":"slide_switch","nodes":["D4","A3","E3"],"state":"left"},
                {"id":"motor1","role":"motor_1","type":"motor","nodes":["D4","D6"]},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["D6","0"],"value":"470u"}
              ]
            }
            """;

    /**
     * CP.L2.9 — series 12 V rails, two SPDTs as H-bridge, series motor + 470 µF.
     * slide1: common→motor, left=+12, right=0; slide2: common→cap, left=0, right=+12.
     */
    private static final String CP_L29_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A2","B2"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["B2","0"],"value":"6"},
                {"id":"slide1","role":"slide_switch_1","type":"slide_switch","nodes":["D4","A2","0"],"state":"left"},
                {"id":"slide2","role":"slide_switch_2","type":"slide_switch","nodes":["F4","0","A2"],"state":"left"},
                {"id":"motor1","role":"motor_1","type":"motor","nodes":["D4","D6"]},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["D6","F4"],"value":"470u"}
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

    @Test
    void cpL28ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L2.8", CP_L28_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL28FailsWithoutCapacitor() throws Exception {
        // Motor alone across rails → continuous DC current, never settles off.
        String noCap = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A3","0"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","E3"],"value":"6"},
                    {"id":"slide1","role":"slide_switch","type":"slide_switch","nodes":["D4","A3","E3"],"state":"left"},
                    {"id":"motor1","role":"motor_1","type":"motor","nodes":["D4","0"]}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("CP.L2.8", noCap);

        assertFalse(result.isPassed(), "Expected fail without series capacitor");
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "idle_motor_stopped".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    @Test
    void cpL29ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L2.9", CP_L29_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(5, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL29FailsOnMidRailSingleSlideTopology() throws Exception {
        // L2.8-style mid-rail + one slide cannot satisfy dual-slide roles.
        ValidationResultDTO result = validationService.validate("CP.L2.9", CP_L28_CIRCUIT);

        assertFalse(result.isPassed());
    }

    /**
     * CP.L2.13 — two supplies (represented as 6 V sources by the board netlist),
     * soft-charge 470 µF via 1 kΩ; RGB branches
     * red 1 kΩ / green 5.1 kΩ / blue 10 kΩ, as shown in the challenge.
     */
    private static final String CP_L213_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["A7","B1"],"state":"open"},
                {"id":"r_chg","role":"resistor_1","type":"resistor","nodes":["B1","C5"],"value":"1000"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["C5","0"],"value":"470u"},
                {"id":"r_red","role":"resistor_2","type":"resistor","nodes":["C5","D1"],"value":"1000"},
                {"id":"led_r","role":"led_1","type":"led","nodes":["D1","0"],"color":"red"},
                {"id":"r_grn","role":"resistor_3","type":"resistor","nodes":["C5","D2"],"value":"5100"},
                {"id":"led_g","role":"led_2","type":"led","nodes":["D2","0"],"color":"green"},
                {"id":"r_blu","role":"resistor_4","type":"resistor","nodes":["C5","D3"],"value":"10000"},
                {"id":"led_b","role":"led_3","type":"led","nodes":["D3","0"],"color":"blue"}
              ]
            }
            """;

    @Test
    void cpL213ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L2.13", CP_L213_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL213FailsWithoutCapacitor() throws Exception {
        String noCap = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"btn1","role":"button_1","type":"switch","nodes":["A7","B1"],"state":"open"},
                    {"id":"r_chg","role":"resistor_1","type":"resistor","nodes":["B1","C5"],"value":"1000"},
                    {"id":"r_red","role":"resistor_2","type":"resistor","nodes":["C5","D1"],"value":"1000"},
                    {"id":"led_r","role":"led_1","type":"led","nodes":["D1","0"],"color":"red"},
                    {"id":"r_grn","role":"resistor_3","type":"resistor","nodes":["C5","D2"],"value":"5100"},
                    {"id":"led_g","role":"led_2","type":"led","nodes":["D2","0"],"color":"green"},
                    {"id":"r_blu","role":"resistor_4","type":"resistor","nodes":["C5","D3"],"value":"10000"},
                    {"id":"led_b","role":"led_3","type":"led","nodes":["D3","0"],"color":"blue"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("CP.L2.13", noCap);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "slow_charge_rgb".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    /**
     * CP.L2.14 — master SPST; dim via 10k; button + 5.1k soft-charges 470 µF into LED via 5.1k.
     */
    private static final String CP_L214_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","MID"],"value":"3"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"3"},
                {"id":"sw1","role":"switch","type":"switch","nodes":["A7","B1"],"state":"closed"},
                {"id":"r_dim","role":"resistor_1","type":"resistor","nodes":["B1","D1"],"value":"10000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["D1","0"],"color":"red"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["B1","C1"],"state":"open"},
                {"id":"r_chg","role":"resistor_2","type":"resistor","nodes":["C1","C5"],"value":"5100"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["C5","0"],"value":"470u"},
                {"id":"r_coup","role":"resistor_3","type":"resistor","nodes":["C5","D1"],"value":"5100"}
              ]
            }
            """;

    /**
     * CP.L2.14 — breadboard-style 2×6 V (12 V) + 5.1 kΩ branches (student photo).
     */
    private static final String CP_L214_TWELVE_VOLT_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A6","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["E8","G4"],"value":"6"},
                {"id":"sw1","role":"switch","type":"switch","nodes":["0","E8"],"state":"closed"},
                {"id":"r_dim","role":"resistor_1","type":"resistor","nodes":["A6","D6"],"value":"5100"},
                {"id":"led1","role":"led_1","type":"led","nodes":["D6","G4"],"color":"red"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["A4","A6"],"state":"open"},
                {"id":"r_chg","role":"resistor_2","type":"resistor","nodes":["A4","D4"],"value":"5100"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["G4","D4"],"value":"470u"},
                {"id":"r_coup","role":"resistor_3","type":"resistor","nodes":["D4","D6"],"value":"5100"}
              ]
            }
            """;

    @Test
    void cpL214ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L2.14", CP_L214_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(4, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL214TwelveVoltBreadboardCircuitPassesValidation() throws Exception {
        ValidationResultDTO result =
                validationService.validate("CP.L2.14", CP_L214_TWELVE_VOLT_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL214FailsWithoutCapacitor() throws Exception {
        String noCap = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","MID"],"value":"3"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"3"},
                    {"id":"sw1","role":"switch","type":"switch","nodes":["A7","B1"],"state":"closed"},
                    {"id":"r_dim","role":"resistor_1","type":"resistor","nodes":["B1","D1"],"value":"10000"},
                    {"id":"led1","role":"led_1","type":"led","nodes":["D1","0"],"color":"red"},
                    {"id":"btn1","role":"button_1","type":"switch","nodes":["B1","C1"],"state":"open"},
                    {"id":"r_chg","role":"resistor_2","type":"resistor","nodes":["C1","C5"],"value":"5100"},
                    {"id":"r_coup","role":"resistor_3","type":"resistor","nodes":["C5","D1"],"value":"5100"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("CP.L2.14", noCap);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "press_gradual_brighten".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    /**
     * CP.L2.15 — green 100 µF, red 470 µF; parallel C on each LED branch (soft charge).
     */
    private static final String CP_L215_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","MID"],"value":"3"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"3"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["A7","B1"],"state":"open"},
                {"id":"rg_chg","role":"resistor_1","type":"resistor","nodes":["B1","C3"],"value":"1000"},
                {"id":"cap_g","role":"capacitor_1","type":"capacitor","nodes":["C3","0"],"value":"100u"},
                {"id":"rg_led","role":"resistor_2","type":"resistor","nodes":["C3","D3"],"value":"1000"},
                {"id":"led_g","role":"led_1","type":"led","nodes":["D3","0"],"color":"green"},
                {"id":"rr_chg","role":"resistor_3","type":"resistor","nodes":["B1","C5"],"value":"1000"},
                {"id":"cap_r","role":"capacitor_2","type":"capacitor","nodes":["C5","0"],"value":"470u"},
                {"id":"rr_led","role":"resistor_4","type":"resistor","nodes":["C5","D5"],"value":"1000"},
                {"id":"led_r","role":"led_2","type":"led","nodes":["D5","0"],"color":"red"}
              ]
            }
            """;

    @Test
    void cpL215ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L2.15", CP_L215_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL215FailsWhenBothCapsEqual() throws Exception {
        String equalCaps = CP_L215_CIRCUIT.replace(
                "\"value\":\"100u\"", "\"value\":\"470u\"");

        ValidationResultDTO result = validationService.validate("CP.L2.15", equalCaps);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "press_green_faster".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    /**
     * CP.L2.16 — SPDT half/full voltage; R–C softens LED brighten/fade (reference photo).
     * Left = 3 V tap, right = 6 V; 1 kΩ charge + 1 kΩ LED + 470 µF.
     */
    private static final String CP_L216_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","MID"],"value":"3"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"3"},
                {"id":"slide","role":"slide_switch","type":"slide_switch","nodes":["B6","MID","A8"],"state":"left"},
                {"id":"r_chg","role":"resistor_1","type":"resistor","nodes":["B6","C4"],"value":"1000"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["C4","0"],"value":"470u"},
                {"id":"r_led","role":"resistor_2","type":"resistor","nodes":["C4","D4"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["D4","0"],"color":"red"}
              ]
            }
            """;

    @Test
    void cpL216ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L2.16", CP_L216_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL216FailsWithoutCapacitor() throws Exception {
        String noCap = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","MID"],"value":"3"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"3"},
                    {"id":"slide","role":"slide_switch","type":"slide_switch","nodes":["B6","MID","A8"],"state":"left"},
                    {"id":"r_chg","role":"resistor_1","type":"resistor","nodes":["B6","C4"],"value":"1000"},
                    {"id":"r_led","role":"resistor_2","type":"resistor","nodes":["C4","D4"],"value":"1000"},
                    {"id":"led1","role":"led_1","type":"led","nodes":["D4","0"],"color":"red"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("CP.L2.16", noCap);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "slide_right_gradual_brighten".equals(c.getLabel()))
                        .findFirst()
                        .orElseThrow()
                        .isPassed());
    }

    /**
     * CP.L4.19 — 2×3 V, dual SPDT voltage doubler, series G+G+B+B + 470 µF.
     * Left: C charges across rails; right: C stacks with supply into LED string.
     */
    private static final String CP_L419_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","MID"],"value":"3"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"3"},
                {"id":"s1","role":"slide_switch_1","type":"slide_switch","nodes":["CT","A8","LEDIN"],"state":"left"},
                {"id":"s2","role":"slide_switch_2","type":"slide_switch","nodes":["CB","0","A8"],"state":"left"},
                {"id":"r_surge","role":"resistor_1","type":"resistor","nodes":["CT","CAP"],"value":"100"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["CAP","CB"],"value":"470u"},
                {"id":"r_led","role":"resistor_2","type":"resistor","nodes":["LEDIN","L1"],"value":"1000"},
                {"id":"lg1","role":"led_1","type":"led","nodes":["L1","L2"],"color":"green"},
                {"id":"lg2","role":"led_2","type":"led","nodes":["L2","L3"],"color":"green"},
                {"id":"lb1","role":"led_3","type":"led","nodes":["L3","L4"],"color":"blue"},
                {"id":"lb2","role":"led_4","type":"led","nodes":["L4","0"],"color":"blue"}
              ]
            }
            """;

    @Test
    void cpL419ReferenceCircuitPassesValidation() throws Exception {
        ValidationResultDTO result = validationService.validate("CP.L4.19", CP_L419_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
        assertTrue(result.getCases().stream().allMatch(c -> c.isPassed()));
    }

    @Test
    void cpL419FailsWithoutCapacitor() throws Exception {
        String noCap = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A8","MID"],"value":"3"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"3"},
                    {"id":"s1","role":"slide_switch_1","type":"slide_switch","nodes":["CT","A8","LEDIN"],"state":"left"},
                    {"id":"s2","role":"slide_switch_2","type":"slide_switch","nodes":["CB","0","A8"],"state":"left"},
                    {"id":"r_surge","role":"resistor_1","type":"resistor","nodes":["CT","CAP"],"value":"100"},
                    {"id":"r_led","role":"resistor_2","type":"resistor","nodes":["LEDIN","L1"],"value":"1000"},
                    {"id":"lg1","role":"led_1","type":"led","nodes":["L1","L2"],"color":"green"},
                    {"id":"lg2","role":"led_2","type":"led","nodes":["L2","L3"],"color":"green"},
                    {"id":"lb1","role":"led_3","type":"led","nodes":["L3","L4"],"color":"blue"},
                    {"id":"lb2","role":"led_4","type":"led","nodes":["L4","0"],"color":"blue"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("CP.L4.19", noCap);

        assertFalse(result.isPassed());
        assertFalse(
                result.getCases().stream()
                        .filter(c -> "boost_pulse_leds_on".equals(c.getLabel()))
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
