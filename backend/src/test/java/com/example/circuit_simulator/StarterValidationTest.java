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
}
