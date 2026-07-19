package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class TcpValidationTest {

    @Autowired
    private CircuitValidationService validationService;

    /**
     * TCP.L1.1 — CE LED; button charges 100 µF; 100 kΩ base bleed holds LED after release.
     */
    private static final String TCP_L11_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"rchg","role":"resistor_1","type":"resistor","nodes":["VCC","BTN"],"value":"100"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["BTN","CAP"],"state":"open"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["CAP","0"],"value":"100u"},
                {"id":"rb","role":"resistor_2","type":"resistor","nodes":["CAP","BASE"],"value":"100000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn"},
                {"id":"rled","role":"resistor_3","type":"resistor","nodes":["VCC","ANODE"],"value":"1000"},
                {"id":"led","role":"led_1","type":"led","nodes":["ANODE","COLL"],"color":"red"}
              ]
            }
            """;

    /**
     * TCP.L1.2 — LED || CE; press charges C and shunts LED; release holds off then LED returns.
     */
    private static final String TCP_L12_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"rchg","role":"resistor_1","type":"resistor","nodes":["VCC","BTN"],"value":"100"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["BTN","CAP"],"state":"open"},
                {"id":"cap","role":"capacitor_1","type":"capacitor","nodes":["CAP","0"],"value":"100u"},
                {"id":"rb","role":"resistor_2","type":"resistor","nodes":["CAP","BASE"],"value":"100000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","NODE","0"],"subtype":"npn"},
                {"id":"rled","role":"resistor_3","type":"resistor","nodes":["VCC","NODE"],"value":"1000"},
                {"id":"led","role":"led_1","type":"led","nodes":["NODE","0"],"color":"red"}
              ]
            }
            """;

    /**
     * TCP.L1.3 — CE lamp; dual 470 µF || ; series 1k base R; fast charge via 100 Ω.
     */
    private static final String TCP_L13_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"rchg","role":"resistor_1","type":"resistor","nodes":["VCC","BTN"],"value":"100"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["BTN","CAP"],"state":"open"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["CAP","0"],"value":"470u"},
                {"id":"cap2","role":"capacitor_2","type":"capacitor","nodes":["CAP","0"],"value":"470u"},
                {"id":"rb1","role":"resistor_2","type":"resistor","nodes":["CAP","MIDB"],"value":"1000"},
                {"id":"rb2","role":"resistor_3","type":"resistor","nodes":["MIDB","BASE"],"value":"1000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
              ]
            }
            """;

    /**
     * TCP.L1.4 — CE lamp; dual 470 µF || ; slow charge via 5.1 kΩ; parallel 1k base bleed.
     */
    private static final String TCP_L14_CIRCUIT = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"rchg","role":"resistor_1","type":"resistor","nodes":["VCC","BTN"],"value":"5100"},
                {"id":"btn","role":"button_1","type":"switch","nodes":["BTN","CAP"],"state":"open"},
                {"id":"cap1","role":"capacitor_1","type":"capacitor","nodes":["CAP","0"],"value":"470u"},
                {"id":"cap2","role":"capacitor_2","type":"capacitor","nodes":["CAP","0"],"value":"470u"},
                {"id":"rb1","role":"resistor_2","type":"resistor","nodes":["CAP","BASE"],"value":"1000"},
                {"id":"rb2","role":"resistor_3","type":"resistor","nodes":["CAP","BASE"],"value":"1000"},
                {"id":"q1","role":"transistor_1","type":"transistor","nodes":["BASE","COLL","0"],"subtype":"npn"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["VCC","COLL"]}
              ]
            }
            """;

    @Test
    void tcpL11ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TCP.L1.1", TCP_L11_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(4, result.getCases().size());
    }

    @Test
    void tcpL12ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TCP.L1.2", TCP_L12_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(4, result.getCases().size());
    }

    @Test
    void tcpL13ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TCP.L1.3", TCP_L13_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(4, result.getCases().size());
    }

    @Test
    void tcpL14ReferenceCircuitPasses() throws Exception {
        ValidationResultDTO result = validationService.validate("TCP.L1.4", TCP_L14_CIRCUIT);

        assertTrue(result.isPassed(), describeFailures(result));
        assertEquals(4, result.getCases().size());
    }

    @Test
    void tcpL11RejectsShuntTopology() throws Exception {
        ValidationResultDTO result = validationService.validate("TCP.L1.1", TCP_L12_CIRCUIT);

        assertFalse(result.isPassed());
    }

    @Test
    void tcpL12RejectsSeriesLedTopology() throws Exception {
        ValidationResultDTO result = validationService.validate("TCP.L1.2", TCP_L11_CIRCUIT);

        assertFalse(result.isPassed());
    }

    @Test
    void tcpL13RejectsSlowChargeTopology() throws Exception {
        ValidationResultDTO result = validationService.validate("TCP.L1.3", TCP_L14_CIRCUIT);

        assertFalse(result.isPassed());
    }

    @Test
    void tcpL14RejectsInstantHoldTopology() throws Exception {
        ValidationResultDTO result = validationService.validate("TCP.L1.4", TCP_L13_CIRCUIT);

        assertFalse(result.isPassed());
    }

    private static String describeFailures(ValidationResultDTO result) {
        if (result.isPassed()) {
            return "";
        }
        StringBuilder sb = new StringBuilder(result.getMessage());
        for (var validationCase : result.getCases()) {
            if (!validationCase.isPassed()) {
                sb.append(" | case ").append(validationCase.getLabel());
                for (var check : validationCase.getChecks()) {
                    if (!check.isPassed()) {
                        sb.append(" [")
                                .append(check.getRole())
                                .append(' ')
                                .append(check.getMetric())
                                .append(' ')
                                .append(check.getOp())
                                .append(' ')
                                .append(check.getExpected())
                                .append(" actual=")
                                .append(check.getActual())
                                .append(']');
                    }
                }
            }
        }
        return sb.toString();
    }
}
