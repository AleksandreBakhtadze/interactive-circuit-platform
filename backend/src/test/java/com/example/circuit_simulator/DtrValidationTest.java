package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class DtrValidationTest {

    @Autowired
    private CircuitValidationService validationService;

    /**
     * DTR.L2.4 — Darlington EF + 1 µF; press spins motor; release holds ≥10 s.
     */
    private static final String DTR_L24_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["VCC","BASE"],"state":"open"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["BASE","0"],"value":"1u"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","VCC","EMIT"],"subtype":"npn_darlington"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["EMIT","0"]}
              ]
            }
            """;

    /** CE topology discharges too fast with 1 µF — must fail the 10 s hold. */
    private static final String DTR_L24_CE_REJECT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["VCC","BASE"],"state":"open"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["BASE","0"],"value":"1u"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn_darlington"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /**
     * DTR.L2.5 — CE: 510 kΩ VCC→base slow idle; button+10 µF+10 kΩ fast; release→slow.
     */
    private static final String DTR_L25_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"rbias","role":"resistor_1","type":"resistor","nodes":["VCC","BASE"],"value":"510000"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["VCC","NODE"],"state":"open"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["NODE","0"],"value":"10u"},
                {"id":"rboost","role":"resistor_2","type":"resistor","nodes":["NODE","BASE"],"value":"10000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn_darlington"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /** No rail→base bias — idle off, fails slow-spin check. */
    private static final String DTR_L25_NO_BIAS_REJECT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["VCC","BASE"],"state":"open"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["BASE","0"],"value":"10u"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn_darlington"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /**
     * DTR.L2.6 — CE + 10 µF + 2×510 kΩ (~1 MΩ) base R; hold ≥15 s then drop.
     */
    private static final String DTR_L26_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["VCC","NODE"],"state":"open"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["NODE","0"],"value":"10u"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["NODE","MIDR"],"value":"510000"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["MIDR","BASE"],"value":"510000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn_darlington"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /** EF keeps spinning too high at end of 35 s window. */
    private static final String DTR_L26_EF_REJECT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["VCC","NODE"],"state":"open"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["NODE","0"],"value":"10u"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["NODE","MIDR"],"value":"510000"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["MIDR","BASE"],"value":"510000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","VCC","EMIT"],"subtype":"npn_darlington"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["EMIT","0"]}
              ]
            }
            """;

    /** No series R — CE discharges too fast; fails 15 s hold. */
    private static final String DTR_L26_NO_R_REJECT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["VCC","BASE"],"state":"open"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["BASE","0"],"value":"10u"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn_darlington"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["VCC","COLL"]}
              ]
            }
            """;

    @Test
    void dtrL24_emitterFollowerPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.4", DTR_L24_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void dtrL24_collectorLoadFailsHold() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.4", DTR_L24_CE_REJECT);
        assertFalse(result.isPassed(), () -> "CE should fail 10s hold: " + result);
    }

    @Test
    void dtrL25_kitBiasPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.5", DTR_L25_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void dtrL25_noBiasFailsSlowIdle() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.5", DTR_L25_NO_BIAS_REJECT);
        assertFalse(result.isPassed(), () -> "no rail bias should fail: " + result);
    }

    @Test
    void dtrL26_collectorHighRPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.6", DTR_L26_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void dtrL26_emitterFollowerFailsEndStop() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.6", DTR_L26_EF_REJECT);
        assertFalse(result.isPassed(), () -> "EF should fail end-stop: " + result);
    }

    @Test
    void dtrL26_noResistorFailsHold() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.6", DTR_L26_NO_R_REJECT);
        assertFalse(result.isPassed(), () -> "no R should fail 15s hold: " + result);
    }

    /**
     * DTR.L2.11 — CE lamp; 2×100 kΩ; 100 µF ‖ button across B–E.
     */
    private static final String DTR_L211_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["VCC","MIDR"],"value":"100000"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["MIDR","BASE"],"value":"100000"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["BASE","0"],"value":"100u"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["BASE","0"],"state":"open"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn_darlington"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /** No capacitor — release turns lamp on immediately. */
    private static final String DTR_L211_NO_CAP_REJECT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["VCC","MIDR"],"value":"100000"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["MIDR","BASE"],"value":"100000"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["BASE","0"],"state":"open"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn_darlington"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
              ]
            }
            """;

    @Test
    void dtrL211_delayedReclaimPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.11", DTR_L211_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void dtrL211_noCapFailsDelay() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.11", DTR_L211_NO_CAP_REJECT);
        assertFalse(result.isPassed(), () -> "no C should fail delay: " + result);
    }

    /**
     * DTR.L2.12 — CE; button→100k→C mid→100k→base; delayed on then hold/fade.
     */
    private static final String DTR_L212_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["VCC","N1"],"state":"open"},
                {"id":"rchg","role":"resistor_1","type":"resistor","nodes":["N1","MIDC"],"value":"100000"},
                {"id":"rbase","role":"resistor_2","type":"resistor","nodes":["MIDC","BASE"],"value":"100000"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["MIDC","0"],"value":"100u"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn_darlington"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /** Cap omitted — lamp turns on immediately through the resistors. */
    private static final String DTR_L212_INSTANT_REJECT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["VCC","N1"],"state":"open"},
                {"id":"rchg","role":"resistor_1","type":"resistor","nodes":["N1","BASE"],"value":"100000"},
                {"id":"rbase","role":"resistor_2","type":"resistor","nodes":["N1","BASE"],"value":"100000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn_darlington"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
              ]
            }
            """;

    @Test
    void dtrL212_delayedOnThenFadePasses() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.12", DTR_L212_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void dtrL212_instantOnFailsDelay() throws Exception {
        ValidationResultDTO result = validationService.validate("DTR.L2.12", DTR_L212_INSTANT_REJECT);
        assertFalse(result.isPassed(), () -> "instant on should fail delay: " + result);
    }
}
