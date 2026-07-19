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

    /**
     * Collector-load lamp: quiescent 5.1k to base (dim); button || 1k to base (bright).
     * nodes: transistor base, collector, emitter.
     */
    private static final String TR_L212_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["VCC","BASE"],"value":"5100"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["VCC","BTN"],"state":"open"},
                {"id":"rb2","role":"resistor_2","type":"resistor","nodes":["BTN","BASE"],"value":"1000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /**
     * Emitter-follower lamp: base via 1k to VCC (bright); button closes lower 1k to GND (dim).
     */
    private static final String TR_L213_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"rtop","role":"resistor_1","type":"resistor","nodes":["VCC","BASE"],"value":"1000"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["BASE","DIV"],"state":"open"},
                {"id":"rbot","role":"resistor_2","type":"resistor","nodes":["DIV","0"],"value":"1000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","VCC","EMIT"],"subtype":"npn"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["EMIT","0"]}
              ]
            }
            """;

    /**
     * Collector-load lamp biased by 100Ω + motor divider; stall pulls base low → lamp off.
     */
    private static final String TR_L214_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["VCC","BASE"],"value":"100"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["BASE","0"],"state":"running"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /**
     * Antagonistic CE: pot → motor BJT base; lamp BJT base from motor collector via 1k.
     * Pot right end after 100 Ω from VCC; position 1 → motor on / lamp off.
     */
    private static final String TR_L216_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"r100","role":"resistor_1","type":"resistor","nodes":["VCC","POTTOP"],"value":"100"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["WIPER","0","POTTOP"],"value":"10000","position":0.0},
                {"id":"qm","role":"transistor_1","type":"transistor","nodes":["WIPER","COLLM","0"],"subtype":"npn"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["VCC","COLLM"]},
                {"id":"rb","role":"resistor_2","type":"resistor","nodes":["COLLM","BASEL"],"value":"1000"},
                {"id":"ql","role":"transistor_2","type":"transistor","nodes":["BASEL","COLLL","0"],"subtype":"npn"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLLL"]}
              ]
            }
            """;

    /**
     * Series NPN AND: lamp only when both bases driven through separate buttons + 1k.
     */
    private static final String TR_L217_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["VCC","B1"],"state":"open"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["B1","BASE1"],"value":"1000"},
                {"id":"btn2","role":"button_2","type":"switch","nodes":["VCC","B2"],"state":"open"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["B2","BASE2"],"value":"1000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE1","MIDN","0"],"subtype":"npn"},
                {"id":"q2","role":"transistor_2","type":"transistor","nodes":["BASE2","COLL","MIDN"],"subtype":"npn"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /** Parallel-button OR (invalid for L2.17 — either button alone lights the lamp). */
    private static final String TR_L217_OR_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["VCC","JOIN"],"state":"open"},
                {"id":"btn2","role":"button_2","type":"switch","nodes":["VCC","JOIN"],"state":"open"},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["JOIN","BASE"],"value":"1000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
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
    void trL212ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.12", TR_L212_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
    }

    @Test
    void trL213ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.13", TR_L213_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
    }

    @Test
    void trL214ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.14", TR_L214_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
    }

    @Test
    void trL216ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.16", TR_L216_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(3, result.getCases().size());
    }

    @Test
    void trL217ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.17", TR_L217_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(5, result.getCases().size());
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

    @Test
    void trL212RejectsEmitterFollowerDimCircuit() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.12", TR_L213_CIRCUIT);

        assertFalse(result.isPassed());
    }

    @Test
    void trL213RejectsCollectorBrightenCircuit() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.13", TR_L212_CIRCUIT);

        assertFalse(result.isPassed());
    }

    @Test
    void trL217RejectsParallelButtonOr() throws Exception {
        ValidationResultDTO result = validationService.validate("TR.L2.17", TR_L217_OR_CIRCUIT);

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
