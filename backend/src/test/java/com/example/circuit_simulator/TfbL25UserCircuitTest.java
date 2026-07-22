package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class TfbL25UserCircuitTest {

    @Autowired CircuitValidationService validationService;

    /** User board: pot wiper → Q1 base; Q1 collector → Q2 base; pull-up on driver node. */
    private static final String USER_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["A7","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["A7","A6"],"state":"closed"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["E4","0","C3"],"value":"10000","position":0.0},
                {"id":"rb","role":"resistor_1","type":"resistor","nodes":["A6","C3"],"value":"1000"},
                {"id":"rpull","role":"resistor_2","type":"resistor","nodes":["A6","D5"],"value":"1000"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["E4","D5","0"],"subtype":"npn"},
                {"id":"ql","role":"transistor_2","type":"transistor","nodes":["D5","C6","0"],"subtype":"npn"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["A6","C6"]}
              ]
            }
            """;

    @Test
    void userPullupTopologyPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TFB.L2.5", USER_CIRCUIT);
        assertTrue(result.isPassed(), () -> "expected pass: " + result);
    }
}
