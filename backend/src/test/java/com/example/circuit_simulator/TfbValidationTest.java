package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class TfbValidationTest {

    @Autowired
    private CircuitValidationService validationService;

    /**
     * TFB.L1.1 — CE Darlington; pot divider → 1 kΩ → base; lamp on collector.
     */
    private static final String TFB_L11_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["WIPER","0","VCC"],"value":"10000","position":0.0},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["WIPER","BASE"],"value":"1000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn_darlington"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /** Emitter follower — mid travel still well below max; fails abrupt CE check. */
    private static final String TFB_L11_EF_REJECT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["WIPER","0","VCC"],"value":"10000","position":0.0},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["WIPER","BASE"],"value":"1000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","VCC","EMIT"],"subtype":"npn_darlington"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["EMIT","0"]}
              ]
            }
            """;

    @Test
    void tfbL11_collectorDarlingtonPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L1.1", TFB_L11_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void tfbL11_emitterFollowerFailsAbruptOn() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L1.1", TFB_L11_EF_REJECT);
        assertFalse(result.isPassed(), () -> "EF should fail abrupt CE: " + result);
    }

    /**
     * TFB.L1.2 — NPN CE → PNP high-side; lamp on PNP collector; 2×1 kΩ.
     */
    private static final String TFB_L12_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["WIPER","0","VCC"],"value":"10000","position":0.0},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["WIPER","NBASE"],"value":"1000"},
                {"id":"rc","role":"resistor_2","type":"resistor","nodes":["VCC","NCOLL"],"value":"1000"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","NCOLL","0"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["NCOLL","PCOLL","VCC"],"subtype":"pnp"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["PCOLL","0"]}
              ]
            }
            """;

    /** NPN emitter follower lamp — mid travel below max; fails abrupt check. */
    private static final String TFB_L12_EF_REJECT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["WIPER","0","VCC"],"value":"10000","position":0.0},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["WIPER","NBASE"],"value":"1000"},
                {"id":"rc","role":"resistor_2","type":"resistor","nodes":["VCC","NBASE"],"value":"1000"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","VCC","EMIT"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["NBASE","VCC","EMIT"],"subtype":"pnp"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["EMIT","0"]}
              ]
            }
            """;

    @Test
    void tfbL12_complementaryPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L1.2", TFB_L12_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void tfbL12_emitterFollowerFailsAbruptOn() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L1.2", TFB_L12_EF_REJECT);
        assertFalse(result.isPassed(), () -> "EF should fail abrupt CE: " + result);
    }

    /**
     * TFB.L2.5 — input NPN collector drives lamp NPN base; lamp ON at low pot.
     */
    private static final String TFB_L25_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["WIPER","0","VCC"],"value":"10000","position":0.0},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["WIPER","NBASE"],"value":"1000"},
                {"id":"rpull","role":"resistor_2","type":"resistor","nodes":["VCC","NBASE2"],"value":"1000"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","NBASE2","0"],"subtype":"npn"},
                {"id":"ql","role":"transistor_2","type":"transistor","nodes":["NBASE2","LCOLL","0"],"subtype":"npn"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","LCOLL"]}
              ]
            }
            """;

    @Test
    void tfbL25_asyncInvertingPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L2.5", TFB_L25_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void tfbL25_synchronousL12Fails() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L2.5", TFB_L12_CIRCUIT);
        assertFalse(result.isPassed(), () -> "L1.2 sync topology should fail L2.5: " + result);
    }

    /**
     * TFB.L3.3 — L1.2 + 1 kΩ feedback NPN base ↔ PNP collector / lamp.
     * Pot wiper tied to NPN base (same node).
     */
    private static final String TFB_L33_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["NBASE","0","VCC"],"value":"10000","position":0.0},
                {"id":"rpull","role":"resistor_1","type":"resistor","nodes":["VCC","PBASE"],"value":"1000"},
                {"id":"rdrive","role":"resistor_2","type":"resistor","nodes":["NCOLL","PBASE"],"value":"1000"},
                {"id":"rfb","role":"resistor_3","type":"resistor","nodes":["LAMP","NBASE"],"value":"1000"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","NCOLL","0"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["PBASE","LAMP","VCC"],"subtype":"pnp"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["LAMP","0"]}
              ]
            }
            """;

    @Test
    void tfbL33_positiveFeedbackPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L3.3", TFB_L33_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void tfbL33_withoutFeedbackFails() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L3.3", TFB_L12_CIRCUIT);
        assertFalse(result.isPassed(), () -> "L1.2 without feedback should fail: " + result);
    }

    /** Feedback via merged nets (soft wire extends the 1 kΩ leg to the NPN base). */
    private static final String TFB_L33_WIRE_FEEDBACK = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["NBASE","0","VCC"],"value":"10000","position":0.0},
                {"id":"rpull","role":"resistor_1","type":"resistor","nodes":["VCC","PBASE"],"value":"1000"},
                {"id":"rdrive","role":"resistor_2","type":"resistor","nodes":["NCOLL","PBASE"],"value":"1000"},
                {"id":"rfb","role":"resistor_3","type":"resistor","nodes":["LAMP","NBASE"],"value":"1000"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","NCOLL","0"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["PBASE","LAMP","VCC"],"subtype":"pnp"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["LAMP","0"]}
              ]
            }
            """;

    @Test
    void tfbL33_wireMergedFeedbackPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L3.3", TFB_L33_WIRE_FEEDBACK);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    /** TFB.L3.4 — two-button latch without pot (user topology). */
    private static final String TFB_L34_NO_POT = """
            {
              "components": [
                {"id":"c_1784713137311_ce2d18","role":"power_supply_1","type":"voltage","nodes":["A3","0"],"value":"6"},
                {"id":"c_1784713138698_w2ogxh","role":"power_supply_2","type":"voltage","nodes":["E8","F5"],"value":"6"},
                {"id":"c_1784713148297_hdhsjc","role":"switch","type":"switch","nodes":["0","E8"],"state":"closed"},
                {"id":"c_1784713174029_f5i4ho","role":"resistor_1","type":"resistor","nodes":["A3","C3"],"value":"1000"},
                {"id":"c_1784713178672_4imkzw","role":"button_1","type":"switch","nodes":["C3","E3"],"state":"open"},
                {"id":"c_1784713180537_krldgc","role":"button_2","type":"switch","nodes":["E3","F5"],"state":"open"},
                {"id":"c_1784713199659_qf8dng","role":"transistor_1","type":"transistor","subtype":"npn","nodes":["E3","D5","F5"]},
                {"id":"c_1784713213397_5fqd4n","role":"resistor_2","type":"resistor","nodes":["B5","D5"],"value":"1000"},
                {"id":"c_1784713215947_tmy8y3","role":"transistor_2","type":"transistor","subtype":"pnp","nodes":["B5","C6","A3"]},
                {"id":"c_1784713227755_qhk1tt","role":"lamp","type":"lamp","nodes":["C6","F5"]},
                {"id":"c_1784713238800_5x8r1z","role":"resistor_3","type":"resistor","nodes":["E3","C6"],"value":"1000"}
              ]
            }
            """;

    @Test
    void tfbL34_twoButtonLatchNoPotPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L3.4", TFB_L34_NO_POT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

}
