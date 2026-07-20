package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class PhotoResistorValidationTest {

    @Autowired
    private CircuitValidationService validationService;

    /**
     * PR.L2.3 reference: LED ∥ (1 kΩ + photoresistor). Torch lowers PR R but the
     * series resistor limits shunt current — LED dims modestly (~9.4 mA → ~7.5 mA).
     */
    @Test
    void prL23ParallelLedWithSeriesPrBranchPasses() throws Exception {
        String circuit = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","C7"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["C7","0"],"value":"6"},
                    {"id":"sw","role":"switch","type":"switch","nodes":["A5","A7"],"state":"closed"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["A5","D4"],"value":"1000"},
                    {"id":"r2","role":"resistor_2","type":"resistor","nodes":["D4","D2"],"value":"1000"},
                    {"id":"pr","role":"photo_resistor","type":"photo_resistor","nodes":["D2","0"],"value":"50000"},
                    {"id":"led","role":"led_1","type":"led","nodes":["D4","0"],"color":"red"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("PR.L2.3", circuit);

        assertTrue(result.isPassed(), result.getMessage());
    }

    /**
     * PR.L2.4 reference: slide left → torch brightens; slide right → torch extinguishes.
     */
    @Test
    void prL24SpdtModeSwitchPasses() throws Exception {
        String circuit = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","C7"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["C7","0"],"value":"6"},
                    {"id":"sw","role":"switch","type":"switch","nodes":["A5","A7"],"state":"closed"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["A5","NR2"],"value":"1000"},
                    {"id":"r2","role":"resistor_2","type":"resistor","nodes":["A5","NLED"],"value":"5100"},
                    {"id":"slide","role":"slide_switch","type":"slide_switch","nodes":["NSW","NR2","0"],"state":"left"},
                    {"id":"pr","role":"photo_resistor","type":"photo_resistor","nodes":["NLED","NSW"],"value":"50000"},
                    {"id":"led","role":"led_1","type":"led","nodes":["NLED","0"],"color":"blue"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("PR.L2.4", circuit);

        assertTrue(result.isPassed(), result.getMessage());
    }

    /**
     * PR.L1.5 reference: LED1+PR series; LED2+R3 fixed return; button ties returns
     * so both track light when pressed.
     */
    @Test
    void prL15SyncViaButtonPasses() throws Exception {
        String circuit = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","C7"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["C7","0"],"value":"6"},
                    {"id":"sw","role":"switch","type":"switch","nodes":["A5","A7"],"state":"closed"},
                    {"id":"btn","role":"button_1","type":"switch","nodes":["N1","N2"],"state":"open"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["A5","L1A"],"value":"1000"},
                    {"id":"r2","role":"resistor_2","type":"resistor","nodes":["A5","L2A"],"value":"1000"},
                    {"id":"r3","role":"resistor_3","type":"resistor","nodes":["N2","0"],"value":"1000"},
                    {"id":"pr","role":"photo_resistor","type":"photo_resistor","nodes":["N1","0"],"value":"50000"},
                    {"id":"led1","role":"led_1","type":"led","nodes":["L1A","N1"],"color":"red"},
                    {"id":"led2","role":"led_2","type":"led","nodes":["L2A","N2"],"color":"red"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("PR.L1.5", circuit);

        assertTrue(result.isPassed(), result.getMessage());
    }

    /**
     * PR.L2.9: 1k vs 10k series branches; PR bridges LED anodes — torch equalizes.
     */
    @Test
    void prL29UnequalBranchesEqualizeWithTorch() throws Exception {
        String circuit = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["VCC","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"sw","role":"switch","type":"switch","nodes":["VCC","TOP"],"state":"closed"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["TOP","N1"],"value":"1000"},
                    {"id":"r2","role":"resistor_2","type":"resistor","nodes":["TOP","N2"],"value":"10000"},
                    {"id":"pr","role":"photo_resistor","type":"photo_resistor","nodes":["N1","N2"],"value":"50000"},
                    {"id":"led1","role":"led_1","type":"led","nodes":["N1","0"],"color":"red"},
                    {"id":"led2","role":"led_2","type":"led","nodes":["N2","0"],"color":"red"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("PR.L2.9", circuit);

        assertTrue(result.isPassed(), result.getMessage());
    }

    /**
     * PR.L3.10: PR–R divider vs mid-rail; antiparallel red/green — ambient red, torch green.
     */
    @Test
    void prL310DayGreenNightRed() throws Exception {
        String circuit = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["VCC","MID"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["VCC","NODE"],"value":"1000"},
                    {"id":"pr","role":"photo_resistor","type":"photo_resistor","nodes":["NODE","0"],"value":"50000"},
                    {"id":"led_red","role":"led_1","type":"led","nodes":["NODE","MID"],"color":"red"},
                    {"id":"led_green","role":"led_2","type":"led","nodes":["MID","NODE"],"color":"green"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("PR.L3.10", circuit);

        assertTrue(result.isPassed(), result.getMessage());
    }

    /**
     * PR.L3.11: series red/green with divider tap — ambient both, torch red,
     * cover green-dominant (1 kΩ student topology).
     */
    @Test
    void prL311DayRedNightGreen() throws Exception {
        String circuit = """
                {
                  "components": [
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A4","C8"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["C8","0"],"value":"6"},
                    {"id":"r1","role":"resistor_1","type":"resistor","nodes":["A4","C7"],"value":"1000"},
                    {"id":"r2","role":"resistor_2","type":"resistor","nodes":["E7","0"],"value":"1000"},
                    {"id":"r3","role":"resistor_3","type":"resistor","nodes":["C4","0"],"value":"1000"},
                    {"id":"pr","role":"photo_resistor","type":"photo_resistor","nodes":["A4","C4"],"value":"50000"},
                    {"id":"led_green","role":"led_1","type":"led","nodes":["C7","C4"],"color":"green"},
                    {"id":"led_red","role":"led_2","type":"led","nodes":["C4","E7"],"color":"red"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("PR.L3.11", circuit);

        assertTrue(result.isPassed(), result.getMessage());
    }
}
