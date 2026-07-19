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
class TransistorValidationTest {

    @Autowired
    private CircuitValidationService validationService;

    /** Collector load: motor between +rail and collector; emitter to ground. */
    private static final String TR_L210_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["WIPER","0","VCC"],"value":"10000","position":0.0},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["WIPER","BASE"],"value":"100"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /** Emitter follower: collector to +rail; motor between emitter and ground. */
    private static final String TR_L211_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["WIPER","0","VCC"],"value":"10000","position":0.0},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["WIPER","BASE"],"value":"100"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","VCC","EMIT"],"subtype":"npn"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["EMIT","0"]}
              ]
            }
            """;

    @Test
    void trL210ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.10", TR_L210_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(4, result.getCases().size());
    }

    @Test
    void trL211ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.11", TR_L211_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(4, result.getCases().size());
    }

    @Test
    void trL210RejectsEmitterFollowerTopology() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.10", TR_L211_CIRCUIT);

        assertFalse(result.isPassed());
    }

    @Test
    void trL211RejectsCollectorSwitchTopology() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.11", TR_L210_CIRCUIT);

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
