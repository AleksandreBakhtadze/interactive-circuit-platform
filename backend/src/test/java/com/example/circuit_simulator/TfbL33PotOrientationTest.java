package com.example.circuit_simulator;

import com.example.circuit_simulator.dto.ValidationResultDTO;
import com.example.circuit_simulator.service.CircuitValidationService;
import com.example.circuit_simulator.service.SimulationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class TfbL33PotOrientationTest {

    @Autowired
    private CircuitValidationService validationService;

    @Autowired
    private SimulationService simulationService;

    private static final String BASE = """
            {
              "components": [
                {"id":"ps1","role":"power_supply_1","type":"voltage","nodes":["FULL","MID"],"value":"6"},
                {"id":"ps2","role":"power_supply_2","type":"voltage","nodes":["MID","0"],"value":"6"},
                {"id":"switch","role":"switch","type":"switch","nodes":["FULL","VCC"],"state":"open"},
                {"id":"pot","role":"variable_resistor","type":"variable_resistor","nodes":["NBASE","LEFT","RIGHT"],"value":"10000","position":0.0},
                {"id":"rpull","role":"resistor_1","type":"resistor","nodes":["VCC","PBASE"],"value":"1000"},
                {"id":"rdrive","role":"resistor_2","type":"resistor","nodes":["NCOLL","PBASE"],"value":"1000"},
                {"id":"rfb","role":"resistor_3","type":"resistor","nodes":["LAMP","NBASE"],"value":"1000"},
                {"id":"qn","role":"transistor_1","type":"transistor","nodes":["NBASE","NCOLL","0"],"subtype":"npn"},
                {"id":"qp","role":"transistor_2","type":"transistor","nodes":["PBASE","LAMP","VCC"],"subtype":"pnp"},
                {"id":"lamp","role":"lamp","type":"lamp","nodes":["LAMP","0"]}
              ]
            }
            """;

    private String circuit(String left, String right) {
        return BASE.replace("\"LEFT\"", "\"" + left + "\"")
                .replace("\"RIGHT\"", "\"" + right + "\"");
    }

    @Test
    void goldenOrientationPasses() throws Exception {
        ValidationResultDTO result =
                validationService.validate("TFB.L3.3", circuit("0", "VCC"));
        assertTrue(result.isPassed(), () -> "golden: " + result);
    }

    @Test
    void swappedPotEndsPassWithDetectedOffHigh() throws Exception {
        ValidationResultDTO result =
                validationService.validate("TFB.L3.3", circuit("VCC", "0"));
        assertTrue(result.isPassed(), () -> "swapped ends: " + result);
    }

    @Test
    void probeSwitchOnPotOffCurrents() throws Exception {
        String swapped = circuit("VCC", "0");
        for (double pot : new double[] {0.0, 1.0}) {
            String json = swapped.replace("\"position\":0.0", "\"position\":" + pot);
            json = json.replace("\"state\":\"open\"", "\"state\":\"closed\"");
            var sim = simulationService.simulateToMap(json, "TFB.L3.3", null, null);
            System.out.println("VCC-0 pot " + pot + " no prior: " + sim.get("nodes"));
        }
        String json = swapped.replace("\"state\":\"open\"", "\"state\":\"closed\"")
                .replace("\"position\":0.0", "\"position\":1.0");
        var risingNear = simulationService.simulateToMap(
                json.replace("\"position\":1.0", "\"position\":0.95"),
                "TFB.L3.3",
                null,
                java.util.Map.of("variable_resistor", 1.0));
        System.out.println("VCC-0 rising_near inverted: " + risingNear.get("nodes"));
        var risingSnap = simulationService.simulateToMap(
                json.replace("\"position\":1.0", "\"position\":0.5"),
                "TFB.L3.3",
                null,
                java.util.Map.of("variable_resistor", 1.0));
        System.out.println("VCC-0 rising_snap inverted: " + risingSnap.get("nodes"));
        var fallingNearNormal = simulationService.simulateToMap(
                swapped.replace("\"state\":\"open\"", "\"state\":\"closed\"")
                        .replace("\"position\":0.0", "\"position\":0.05"),
                "TFB.L3.3",
                null,
                java.util.Map.of("variable_resistor", 1.0));
        System.out.println("VCC-0 falling_near normal: " + fallingNearNormal.get("nodes"));
        var falling = simulationService.simulateToMap(
                json,
                "TFB.L3.3",
                null,
                java.util.Map.of("variable_resistor", 0.0));
        System.out.println("VCC-0 falling inverted: " + falling.get("nodes"));
    }
}
