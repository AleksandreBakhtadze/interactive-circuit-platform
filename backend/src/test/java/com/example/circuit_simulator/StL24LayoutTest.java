package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class StL24LayoutTest {

    @Autowired
    private CircuitValidationService validationService;

    @Test
    void picturedSharedMidRailLayout() throws Exception {
        // Lamp B1-D1, btn1 B1-B3, btn2 B3-B5, PS1 B5-D5, PS2 D5/D3, SW D3-D1
        String seriesAiding = """
                {
                  "components": [
                    {"id":"lamp","role":"lamp","type":"lamp","nodes":["B1","D1"]},
                    {"id":"b1","role":"button_1","type":"switch","nodes":["B1","B3"],"state":"open"},
                    {"id":"b2","role":"button_2","type":"switch","nodes":["B3","B5"],"state":"open"},
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["B5","D5"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["D5","D3"],"value":"6"},
                    {"id":"sw","role":"switch","type":"switch","nodes":["D3","D1"],"state":"open"}
                  ]
                }
                """;
        String opposingShared = """
                {
                  "components": [
                    {"id":"lamp","role":"lamp","type":"lamp","nodes":["B1","D1"]},
                    {"id":"b1","role":"button_1","type":"switch","nodes":["B1","B3"],"state":"open"},
                    {"id":"b2","role":"button_2","type":"switch","nodes":["B3","B5"],"state":"open"},
                    {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["B5","D5"],"value":"6"},
                    {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["D3","D5"],"value":"6"},
                    {"id":"sw","role":"switch","type":"switch","nodes":["D3","D1"],"state":"open"}
                  ]
                }
                """;

        ValidationResultDTO aiding = validationService.validate("ST.L2.4", seriesAiding);
        ValidationResultDTO opposing = validationService.validate("ST.L2.4", opposingShared);

        System.out.println("seriesAiding passed=" + aiding.isPassed() + " msg=" + aiding.getMessage());
        System.out.println("opposingShared passed=" + opposing.isPassed() + " msg=" + opposing.getMessage());
        if (!aiding.isPassed()) {
            aiding.getCases().stream()
                    .filter(c -> !c.isPassed())
                    .forEach(c -> System.out.println(" aiding fail " + c.getLabel() + " " + c.getChecks()));
        }
        if (!opposing.isPassed()) {
            opposing.getCases().stream()
                    .filter(c -> !c.isPassed())
                    .forEach(c -> System.out.println(" opposing fail " + c.getLabel() + " " + c.getChecks()));
        }

        assertTrue(aiding.isPassed(), aiding.getMessage());
        assertTrue(opposing.isPassed(), opposing.getMessage());
    }
}
