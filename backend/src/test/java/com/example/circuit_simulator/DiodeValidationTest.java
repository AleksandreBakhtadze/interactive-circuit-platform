package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class DiodeValidationTest {

    @Autowired
    private CircuitValidationService validationService;

    private static final String DI_L11_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"d1","role":"diode_1","type":"led","nodes":["MID","OUT"],"color":"plain"},
                {"id":"button","role":"button_1","type":"switch","nodes":["FULL","OUT"],"state":"open"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["OUT","0"]}
              ]
            }
            """;

    private static final String DI_L22_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","SRC"],"state":"open"},
                {"id":"d1","role":"diode_1","type":"led","nodes":["SRC","D12"],"color":"plain"},
                {"id":"d2","role":"diode_2","type":"led","nodes":["D12","OUT"],"color":"plain"},
                {"id":"button","role":"button_1","type":"switch","nodes":["SRC","OUT"],"state":"open"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["OUT","0"]}
              ]
            }
            """;

    @Test
    void diL11ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("DI.L1.1", DI_L11_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(2, result.getCases().size());
    }

    @Test
    void diL11RejectsReversedDiode() throws Exception {
        String reversed = DI_L11_CIRCUIT.replace(
                "\"nodes\":[\"MID\",\"OUT\"],\"color\":\"plain\"",
                "\"nodes\":[\"OUT\",\"MID\"],\"color\":\"plain\"");

        ValidationResultDTO result = validationService.validate("DI.L1.1", reversed);

        assertFalse(result.isPassed());
    }

    /**
     * Pedagogical DI.L1.4 (one shared resistor): parallel LED vs LED+2×diodes,
     * button bypasses the diodes. Weak LED is dim but lit; button equalizes.
     */
    private static final String DI_L14_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","TOP"],"state":"open"},
                {"id":"led1","role":"led_1","type":"led","nodes":["TOP","W1"],"color":"red"},
                {"id":"d1","role":"diode_1","type":"led","nodes":["W1","W2"],"color":"plain"},
                {"id":"d2","role":"diode_2","type":"led","nodes":["W2","JOIN"],"color":"plain"},
                {"id":"button","role":"button_1","type":"switch","nodes":["W1","JOIN"],"state":"open"},
                {"id":"led2","role":"led_2","type":"led","nodes":["TOP","JOIN"],"color":"red"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["JOIN","0"],"value":"1000"}
              ]
            }
            """;

    @Test
    void diL14ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("DI.L1.4", DI_L14_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
    }

    @Test
    void diL14RejectsReversedDiode() throws Exception {
        // A reversed series diode blocks the weak branch when the button is open.
        String reversed = DI_L14_CIRCUIT.replace(
                "\"nodes\":[\"W1\",\"W2\"],\"color\":\"plain\"",
                "\"nodes\":[\"W2\",\"W1\"],\"color\":\"plain\"");

        ValidationResultDTO result = validationService.validate("DI.L1.4", reversed);

        assertFalse(result.isPassed(), describeFailures(result));
    }

    @Test
    void diL22ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("DI.L2.2", DI_L22_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
    }

    @Test
    void diL22RejectsButtonThatDoesNotBypassDiodes() throws Exception {
        String noBypass = DI_L22_CIRCUIT.replace(
                "\"nodes\":[\"SRC\",\"OUT\"],\"state\":\"open\"",
                "\"nodes\":[\"SRC\",\"D12\"],\"state\":\"open\"");

        ValidationResultDTO result = validationService.validate("DI.L2.2", noBypass);

        assertFalse(result.isPassed());
    }

    /**
     * Pot divider → two equal LED+R branches; diode+C on one branch holds charge
     * when the wiper steps toward the dim end.
     */
    private static final String DI_L36_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["W","FULL","0"],"value":"10000","position":0.5},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["W","A1"],"value":"470"},
                {"id":"led1","role":"led_1","type":"led","nodes":["A1","0"],"color":"red"},
                {"id":"d1","role":"diode_1","type":"led","nodes":["W","HOLD"],"color":"plain"},
                {"id":"c1","role":"capacitor_1","type":"capacitor","nodes":["HOLD","0"],"value":"470u"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["HOLD","A2"],"value":"470"},
                {"id":"led2","role":"led_2","type":"led","nodes":["A2","0"],"color":"red"}
              ]
            }
            """;

    @Test
    void diL36ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("DI.L3.6", DI_L36_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
    }

    @Test
    void diL36RejectsMissingHoldDiode() throws Exception {
        String reversed = DI_L36_CIRCUIT.replace(
                "\"nodes\":[\"W\",\"HOLD\"]",
                "\"nodes\":[\"HOLD\",\"W\"]");

        ValidationResultDTO result = validationService.validate("DI.L3.6", reversed);

        assertFalse(result.isPassed());
    }

    private static String describeFailures(ValidationResultDTO result) {
        if (result.isPassed()) {
            return "";
        }
        StringBuilder sb = new StringBuilder(result.getMessage());
        for (var validationCase : result.getCases()) {
            if (!validationCase.isPassed()) {
                sb.append(" | case ").append(validationCase.getLabel());
                for (var check : validationCase.getChecks()) {
                    if (!check.isPassed()) {
                        sb.append(" [")
                                .append(check.getRole())
                                .append(' ')
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
