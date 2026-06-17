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
