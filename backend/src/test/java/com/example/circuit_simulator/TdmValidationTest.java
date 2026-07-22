package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class TdmValidationTest {

    @Autowired CircuitValidationService validationService;

    /**
     * TDM.L1.7 — complementary EF half-bridge: pot across ±6 V mid-rail drives
     * shared bases; motor OUT–MID. Center stop; ends reverse.
     */
    private static final String TDM_L17_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["CTRL","0","FULL"],"value":"10000","position":0.5},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["CTRL","FULL","OUT"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["CTRL","0","OUT"],"subtype":"pnp"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["OUT","MID"]}
              ]
            }
            """;

    /**
     * TDM.L2.8 — L1.7 half-bridge + CE NPN with 1 kΩ pull-up so pot travel flips
     * motor direction over a narrow threshold.
     */
    private static final String TDM_L28_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["WIPER","0","FULL"],"value":"10000","position":0.0},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["FULL","CTRL"],"value":"1000"},
                {"id":"qsw","role":"transistor_3","type":"transistor","nodes":["WIPER","CTRL","0"],"subtype":"npn"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["CTRL","FULL","OUT"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["CTRL","0","OUT"],"subtype":"pnp"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["OUT","MID"]}
              ]
            }
            """;

    /**
     * TDM.L2.3 — dual-rail center tap; SPDT drives complementary PNP + NPN Darlington
     * bases via 2×1 kΩ so one motor pole swings 0↔VCC and reverses vs MID.
     */
    private static final String TDM_L23_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"closed"},
                {"id":"slide","role":"slide_switch","type":"slide_switch","nodes":["CTRL","VCC","0"],"state":"left"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["CTRL","NBASE"],"value":"1000"},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["CTRL","PBASE"],"value":"1000"},
                {"id":"qp","role":"transistor_1","type":"transistor","nodes":["PBASE","OUT","VCC"],"subtype":"pnp"},
                {"id":"qn1","role":"transistor_2","type":"transistor","nodes":["NBASE","OUT","NMID"],"subtype":"npn"},
                {"id":"qn2","role":"transistor_3","type":"transistor","nodes":["NMID","OUT","0"],"subtype":"npn"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["OUT","MID"]}
              ]
            }
            """;

    /**
     * TDM.L2.4 — bipolar H-bridge: each motor pole is an NPN+PNP emitter pair;
     * one button pulls that pair's bases to the negative rail, the 1 kΩ pulls
     * them to the positive rail when released.
     */
    private static final String TDM_L24_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A3","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["E8","F7"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["0","E8"],"state":"open"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["A3","C3"],"value":"1000"},
                {"id":"btn1","role":"button_1","type":"switch","nodes":["F7","C3"],"state":"open"},
                {"id":"qn1","role":"transistor_1","type":"transistor","nodes":["C3","A3","D4"],"subtype":"npn"},
                {"id":"qp1","role":"transistor_2","type":"transistor","nodes":["C3","F7","D4"],"subtype":"pnp"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["D4","D7"]},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["A3","F5"],"value":"1000"},
                {"id":"btn2","role":"button_2","type":"switch","nodes":["F7","F5"],"state":"open"},
                {"id":"qp2","role":"transistor_3","type":"transistor","nodes":["F5","F7","D7"],"subtype":"pnp"},
                {"id":"qn2","role":"transistor_4","type":"transistor","nodes":["F5","A3","D7"],"subtype":"npn"}
              ]
            }
            """;

    @Test
    void tdmL17_potHalfBridgeReversePasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TDM.L1.7", TDM_L17_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void tdmL28_abruptPotReversePasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TDM.L2.8", TDM_L28_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    @Test
    void tdmL23_complementaryReversePasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TDM.L2.3", TDM_L23_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    /** Frontend validate() sends switchStates={} so the SPST defaults to open. */
    @Test
    void tdmL23_passesWhenSubmittedWithSwitchOpen() throws Exception {
        String openMaster = TDM_L23_CIRCUIT.replaceFirst(
                "\"state\":\"closed\"",
                "\"state\":\"open\"");
        ValidationResultDTO result = validationService.validate("TDM.L2.3", openMaster);
        assertTrue(result.isPassed(), () -> "expected pass with forced closed: " + result);
    }

    @Test
    void tdmL24_twoButtonReversePasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TDM.L2.4", TDM_L24_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }

    /**
     * TDM.L3.5 — L2.4 H-bridge with one button replaced by NPN Darlington;
     * series 1 kΩ from the remaining button node into the Darlington base so
     * Vbe clamp does not turn both bridge halves on at once.
     */
    private static final String TDM_L35_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A3","0"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["E8","F7"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["0","E8"],"state":"open"},
                {"id":"r1","role":"resistor_1","type":"resistor","nodes":["A3","C3"],"value":"1000"},
                {"id":"dar","role":"transistor_5","type":"transistor","nodes":["BX","C3","F7"],"subtype":"npn_darlington"},
                {"id":"rb","role":"resistor_3","type":"resistor","nodes":["F5","BX"],"value":"1000"},
                {"id":"qn1","role":"transistor_1","type":"transistor","nodes":["C3","A3","D4"],"subtype":"npn"},
                {"id":"qp1","role":"transistor_2","type":"transistor","nodes":["C3","F7","D4"],"subtype":"pnp"},
                {"id":"motor","role":"motor_1","type":"motor","nodes":["D4","D7"]},
                {"id":"r2","role":"resistor_2","type":"resistor","nodes":["A3","F5"],"value":"1000"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["F7","F5"],"state":"open"},
                {"id":"qp2","role":"transistor_3","type":"transistor","nodes":["F5","F7","D7"],"subtype":"pnp"},
                {"id":"qn2","role":"transistor_4","type":"transistor","nodes":["F5","A3","D7"],"subtype":"npn"}
              ]
            }
            """;

    @Test
    void tdmL35_oneButtonReversePasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TDM.L3.5", TDM_L35_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }
}
