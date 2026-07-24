package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class GenValidationTest {

    @Autowired
    private CircuitValidationService validationService;

    /**
     * GEN.L2.1 — complementary NPN+PNP flasher: lamp on NPN collector, PNP drives
     * NPN base, pot biases PNP base, 100 µF from lamp/collector back to PNP base.
     */
    private static final String GEN_L21_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","NCOLL"]},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","NCOLL","0"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["PBASE","PCOLL","VCC"],"subtype":"pnp"},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["PCOLL","NBASE"],"value":"1000"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["PBASE","VCC","POTC"],"value":"10000","position":0.31},
                {"id":"rg","role":"resistor_2","type":"resistor","nodes":["POTC","0"],"value":"10000"},
                {"id":"c","role":"capacitor_1","type":"capacitor","nodes":["NCOLL","PBASE"],"value":"100u"}
              ]
            }
            """;

    /**
     * GEN.L2.2 — classic two-NPN astable with 470 µF for a slower blink (~10 s class).
     */
    private static final String GEN_L22_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","C1"]},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["B1","C1","0"],"subtype":"npn"},
                {"id":"rc2","role":"resistor_1","type":"resistor","nodes":["VCC","C2"],"value":"1000"},
                {"id":"q2","role":"transistor_2","type":"transistor","nodes":["B2","C2","0"],"subtype":"npn"},
                {"id":"rb1","role":"resistor_2","type":"resistor","nodes":["VCC","B1"],"value":"47000"},
                {"id":"rb2","role":"resistor_3","type":"resistor","nodes":["VCC","B2"],"value":"100000"},
                {"id":"cfb1","role":"capacitor_1","type":"capacitor","nodes":["C1","B2"],"value":"470u"},
                {"id":"cfb2","role":"capacitor_2","type":"capacitor","nodes":["C2","B1"],"value":"470u"}
              ]
            }
            """;

    /**
     * GEN.L2.3 — asymmetrical two-NPN with anti-parallel LEDs on mid-rail / 100 Ω load.
     */
    private static final String GEN_L23_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["B1","C1","0"],"subtype":"npn"},
                {"id":"q2","role":"transistor_2","type":"transistor","nodes":["B2","C2","0"],"subtype":"npn"},
                {"id":"rc1","role":"resistor_1","type":"resistor","nodes":["VCC","C1"],"value":"100"},
                {"id":"rc2","role":"resistor_2","type":"resistor","nodes":["VCC","C2"],"value":"1000"},
                {"id":"rled","role":"resistor_3","type":"resistor","nodes":["MID","LN"],"value":"1000"},
                {"id":"led1","role":"led_1","type":"led","nodes":["C1","LN"],"color":"red"},
                {"id":"led2","role":"led_2","type":"led","nodes":["LN","C1"],"color":"red"},
                {"id":"c","role":"capacitor_1","type":"capacitor","nodes":["C1","B2"],"value":"10u"},
                {"id":"rb1","role":"resistor_4","type":"resistor","nodes":["C2","B1"],"value":"100000"},
                {"id":"r10","role":"resistor_5","type":"resistor","nodes":["VCC","PT"],"value":"10000"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["PW","PT","0"],"value":"10000","position":0.35},
                {"id":"rb2","role":"resistor_6","type":"resistor","nodes":["PW","B2"],"value":"100000"}
              ]
            }
            """;

    /**
     * GEN.L2.4 — symmetric two-NPN LED multivibrator with 100 µF and pots.
     */
    private static final String GEN_L24_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["B1","C1","0"],"subtype":"npn"},
                {"id":"q2","role":"transistor_2","type":"transistor","nodes":["B2","C2","0"],"subtype":"npn"},
                {"id":"rc1","role":"resistor_1","type":"resistor","nodes":["VCC","C1"],"value":"100"},
                {"id":"rc2","role":"resistor_2","type":"resistor","nodes":["VCC","C2"],"value":"100"},
                {"id":"led1","role":"led_1","type":"led","nodes":["C1","L1"],"color":"red"},
                {"id":"rled1","role":"resistor_3","type":"resistor","nodes":["L1","0"],"value":"1000"},
                {"id":"led2","role":"led_2","type":"led","nodes":["C2","L2"],"color":"red"},
                {"id":"rled2","role":"resistor_4","type":"resistor","nodes":["L2","0"],"value":"1000"},
                {"id":"c1","role":"capacitor_1","type":"capacitor","nodes":["C1","X1"],"value":"100u"},
                {"id":"r5a","role":"resistor_5","type":"resistor","nodes":["X1","B2"],"value":"5100"},
                {"id":"c2","role":"capacitor_2","type":"capacitor","nodes":["C2","X2"],"value":"100u"},
                {"id":"r5b","role":"resistor_6","type":"resistor","nodes":["X2","B1"],"value":"5100"},
                {"id":"pot1","role":"variable_resistor_1","type":"variable_resistor","nodes":["B1","VCC","0"],"value":"10000","position":0.05},
                {"id":"pot2","role":"variable_resistor_2","type":"variable_resistor","nodes":["B2","VCC","0"],"value":"10000","position":0.05}
              ]
            }
            """;

    /**
     * GEN.L2.5 — two-NPN motor reverse oscillator (motor between collectors).
     */
    private static final String GEN_L25_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["B1","C1","0"],"subtype":"npn"},
                {"id":"q2","role":"transistor_2","type":"transistor","nodes":["B2","C2","0"],"subtype":"npn"},
                {"id":"rc1","role":"resistor_1","type":"resistor","nodes":["VCC","C1"],"value":"20"},
                {"id":"rc2","role":"resistor_2","type":"resistor","nodes":["VCC","C2"],"value":"20"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["C1","C2"]},
                {"id":"rb1","role":"resistor_3","type":"resistor","nodes":["VCC","B1"],"value":"47000"},
                {"id":"rb2","role":"resistor_4","type":"resistor","nodes":["VCC","B2"],"value":"100000"},
                {"id":"c1","role":"capacitor_1","type":"capacitor","nodes":["C1","B2"],"value":"470u"},
                {"id":"c2","role":"capacitor_2","type":"capacitor","nodes":["C2","B1"],"value":"470u"}
              ]
            }
            """;

    /** Steady lamp-on (no oscillation) — must fail free-run blink checks. */
    private static final String LATCHED_ON = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn"},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["VCC","BASE"],"value":"1000"},
                {"id":"q2","role":"transistor_2","type":"transistor","nodes":["BASE2","COLL2","0"],"subtype":"npn"},
                {"id":"rb2","role":"resistor_2","type":"resistor","nodes":["VCC","BASE2"],"value":"10000"}
              ]
            }
            """;

    @Test
    void genL21ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("GEN.L2.1", GEN_L21_CIRCUIT);
        assertTrue(result.isPassed(), describeFailures(result));
    }

    @Test
    void genL22ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("GEN.L2.2", GEN_L22_CIRCUIT);
        assertTrue(result.isPassed(), describeFailures(result));
    }

    @Test
    void genL23ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("GEN.L2.3", GEN_L23_CIRCUIT);
        assertTrue(result.isPassed(), describeFailures(result));
    }

    @Test
    void genL24ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("GEN.L2.4", GEN_L24_CIRCUIT);
        assertTrue(result.isPassed(), describeFailures(result));
    }

    @Test
    void genL25ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("GEN.L2.5", GEN_L25_CIRCUIT);
        assertTrue(result.isPassed(), describeFailures(result));
    }

    @Test
    void genL21RejectsMissingPnp() throws Exception {
        ValidationResultDTO result = validationService.validate("GEN.L2.1", GEN_L22_CIRCUIT);
        assertFalse(result.isPassed());
    }

    @Test
    void genL22RejectsLatchedOn() throws Exception {
        ValidationResultDTO result = validationService.validate("GEN.L2.2", LATCHED_ON);
        assertFalse(result.isPassed());
    }

    @Test
    void genL25RejectsMissingMotor() throws Exception {
        ValidationResultDTO result = validationService.validate("GEN.L2.5", GEN_L24_CIRCUIT);
        assertFalse(result.isPassed());
    }

    private static String describeFailures(ValidationResultDTO result) {
        if (result.getMessage() != null && !result.getMessage().isBlank()) {
            StringBuilder sb = new StringBuilder(result.getMessage());
            if (result.getCases() != null) {
                result.getCases().forEach(c -> {
                    if (!c.isPassed() && c.getChecks() != null) {
                        c.getChecks().forEach(ch -> {
                            if (!ch.isPassed()) {
                                sb.append(" | ")
                                        .append(ch.getRole())
                                        .append('.')
                                        .append(ch.getMetric())
                                        .append('=')
                                        .append(ch.getActual());
                            }
                        });
                    }
                });
            }
            return sb.toString();
        }
        StringBuilder sb = new StringBuilder();
        if (result.getCases() != null) {
            result.getCases().forEach(c -> {
                if (!c.isPassed()) {
                    sb.append(c.getLabel()).append(": ");
                    if (c.getChecks() != null) {
                        c.getChecks().forEach(ch -> {
                            if (!ch.isPassed()) {
                                sb.append(ch.getRole())
                                        .append('.')
                                        .append(ch.getMetric())
                                        .append('=')
                                        .append(ch.getActual())
                                        .append("; ");
                            }
                        });
                    }
                }
            });
        }
        return sb.toString();
    }
}
