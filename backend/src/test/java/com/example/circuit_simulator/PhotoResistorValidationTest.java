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
}
