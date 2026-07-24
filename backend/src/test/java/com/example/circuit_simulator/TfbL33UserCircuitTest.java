package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * TFB.L3.3 board topology from the student screenshot: pot on NPN base,
 * NPN collector pull-up driving PNP base, 1 kΩ lamp→base feedback.
 */
@SpringBootTest
class TfbL33UserCircuitTest {

    @Autowired
    private CircuitValidationService validationService;

    /** Pot ends GND / VCC (golden order). */
    private static final String USER_A = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["NBASE","0","VCC"],"value":"10000","position":0.0},
                {"id":"rpull","role":"resistor_1","type":"resistor","nodes":["VCC","NCOLL"],"value":"1000"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","NCOLL","0"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["NCOLL","LAMP","VCC"],"subtype":"pnp"},
                {"id":"rfb","role":"resistor_3","type":"resistor","nodes":["LAMP","NBASE"],"value":"1000"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["LAMP","0"]}
              ]
            }
            """;

    /** Pot B↔C swapped (common board orientation). */
    private static final String USER_B = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["NBASE","VCC","0"],"value":"10000","position":0.0},
                {"id":"rpull","role":"resistor_1","type":"resistor","nodes":["VCC","NCOLL"],"value":"1000"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","NCOLL","0"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["NCOLL","LAMP","VCC"],"subtype":"pnp"},
                {"id":"rfb","role":"resistor_3","type":"resistor","nodes":["LAMP","NBASE"],"value":"1000"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["LAMP","0"]}
              ]
            }
            """;

    @Test
    void screenshotTopologyGoldenPotEndsPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L3.3", USER_A);
        assertTrue(result.isPassed(), () -> "USER_A: " + result);
    }

    @Test
    void screenshotTopologySwappedPotEndsPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L3.3", USER_B);
        assertTrue(result.isPassed(), () -> "USER_B: " + result);
    }

    /**
     * Common student wiring: NPN base on pot pin B, apex A on VCC (rheostat).
     * Validator must rotate so the base pin becomes the wiper.
     */
    private static final String RHEOSTAT_BASE_ON_B = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["VCC","NBASE","0"],"value":"10000","position":0.5},
                {"id":"rpull","role":"resistor_1","type":"resistor","nodes":["VCC","NCOLL"],"value":"1000"},
                {"id":"rseries","role":"resistor_2","type":"resistor","nodes":["NCOLL","PBASE"],"value":"1000"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","NCOLL","0"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["PBASE","LAMP","VCC"],"subtype":"pnp"},
                {"id":"rfb","role":"resistor_3","type":"resistor","nodes":["LAMP","NBASE"],"value":"1000"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["LAMP","0"]}
              ]
            }
            """;

    @Test
    void rheostatBaseOnPinBIsRemappedAndPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L3.3", RHEOSTAT_BASE_ON_B);
        assertTrue(result.isPassed(), () -> "rheostat: " + result);
    }
}
