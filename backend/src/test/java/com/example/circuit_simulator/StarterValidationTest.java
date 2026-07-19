package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class StarterValidationTest {

    @Autowired
    private CircuitValidationService validationService;

    /**
     * ST.L1.8 intended series circuit: one 6 V supply, switch, momentary
     * button, 1 kΩ resistor, and red LED. Its expected current is about 4 mA.
     */
    @Test
    void stL18ReferenceCircuitPassesAtFourMilliamps() throws Exception {
        String circuit = """
                {
                  "components": [
                    {"id":"ps","role":"power_supply_1","type":"voltage","nodes":["VCC","0"],"value":"6"},
                    {"id":"sw","role":"switch","type":"switch","nodes":["VCC","N1"],"state":"open"},
                    {"id":"button","role":"button_1","type":"switch","nodes":["N1","N2"],"state":"open"},
                    {"id":"resistor","role":"resistor_1","type":"resistor","nodes":["N2","N3"],"value":"1000"},
                    {"id":"led","role":"led_1","type":"led","nodes":["N3","0"],"color":"red"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("ST.L1.8", circuit);

        assertTrue(result.isPassed(), result.getMessage());
    }

    @Test
    void stL24PicturedSeriesCircuitPassesWhenBothButtonsAreClosed() throws Exception {
        String circuit = """
                {
                  "components": [
                    {"id":"lamp","role":"lamp","type":"lamp","nodes":["B1","B3"]},
                    {"id":"button1","role":"button_1","type":"switch","nodes":["B3","B5"],"state":"open"},
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["B5","D5"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["D5","0"],"value":"6"},
                    {"id":"switch","role":"switch","type":"switch","nodes":["0","D1"],"state":"open"},
                    {"id":"button2","role":"button_2","type":"switch","nodes":["D1","B1"],"state":"open"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("ST.L2.4", circuit);

        assertTrue(result.isPassed(), result.getMessage());
    }

    @Test
    void stL24AcceptsRotatedSecondSupplyAcrossSeriesSwitch() throws Exception {
        String circuit = """
                {
                  "components": [
                    {"id":"lamp","role":"lamp","type":"lamp","nodes":["A2","0"]},
                    {"id":"button1","role":"button_1","type":"switch","nodes":["A2","A4"],"state":"open"},
                    {"id":"button2","role":"button_2","type":"switch","nodes":["A4","A6"],"state":"open"},
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A6","C6"],"value":"6"},
                    {"id":"switch","role":"switch","type":"switch","nodes":["C6","C4"],"state":"open"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["0","C4"],"value":"6"}
                  ]
                }
                """;

        ValidationResultDTO result = validationService.validate("ST.L2.4", circuit);

        assertTrue(result.isPassed(), result.getMessage());
    }
}
