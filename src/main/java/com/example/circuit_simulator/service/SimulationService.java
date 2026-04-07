package com.example.circuit_simulator.service;

import com.example.circuit_simulator.utils.SpiceGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SimulationService {

    public String simulate(String circuitJson) {
        try {
            Map<String, Double> nodeVoltages = runAndParse(circuitJson);

            Map<String, Object> componentVoltages =
                    computeComponentVoltages(circuitJson, nodeVoltages);

            return "{ " +
                    "\"nodes\": " + NgspiceService.toJson(nodeVoltages) + "," +
                    "\"components\": " + NgspiceService.toJson(componentVoltages) +
                    "}";

        } catch (Exception e) {
            return "{ \"error\": \"" + e.getMessage() + "\" }";
        }
    }

    private Map<String, Double> runAndParse(String circuitJson) throws Exception {
        String spice = SpiceGenerator.generateSpice(circuitJson);

        Files.write(Paths.get("circuit.cir"), spice.getBytes());

        NgspiceService.runNgspice("circuit.cir");

        return NgspiceService.parse("output.txt");
    }

    private Map<String, Object> computeComponentVoltages(            String circuitJson,
                                                                     Map<String, Double> nodeVoltages) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(circuitJson, Map.class);

        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        Map<String, Object> result = new HashMap<>();
        for (Map<String, Object> comp : components) {

            String id = (String) comp.get("id");
            String type = (String) comp.get("type");
            List<String> nodes = (List<String>) comp.get("nodes");

            if (nodes == null || nodes.size() < 2) continue;

            String n1 = nodes.get(0);
            String n2 = nodes.get(1);

            double v1 = getVoltage(n1, nodeVoltages);
            double v2 = getVoltage(n2, nodeVoltages);
            double voltage = v1 - v2;

            switch (type) {

                case "motor" -> {
                    String currentKey = "@r_" + id.toLowerCase() + "[i]";
                    double current = nodeVoltages.getOrDefault(currentKey, 0.0);
                    result.put(id, clean(current));
                }

                case "slide_switch" -> {
                    String state = (String) comp.get("state");

                    String common = nodes.get(0);
                    String active = "left".equals(state) ? nodes.get(1) : nodes.get(2);

                    double vCommon = getVoltage(common, nodeVoltages);
                    double vActive = getVoltage(active, nodeVoltages);

                    result.put(id, clean(vCommon - vActive));
                }

                case "variable_resistor" -> {
                    String input = nodes.get(1);
                    String wiper = nodes.get(0);

                    double vInput = getVoltage(input, nodeVoltages);
                    double vWiper = getVoltage(wiper, nodeVoltages);

                    result.put(id, clean(vInput - vWiper));
                }

                case "transistor" -> {
                    String base = nodes.get(0);
                    String collector = nodes.get(1);
                    String emitter = nodes.get(2);

                    double vB = getVoltage(base, nodeVoltages);
                    double vC = getVoltage(collector, nodeVoltages);
                    double vE = getVoltage(emitter, nodeVoltages);

                    double vbe = vB - vE;
                    double vce = vC - vE;

                    result.put(id + "_vbe", clean(vbe));
                    result.put(id + "_vce", clean(vce));

                    double ic = nodeVoltages.getOrDefault("@q_" + id.toLowerCase() + "[ic]", 0.0);
                    double ib = nodeVoltages.getOrDefault("@q_" + id.toLowerCase() + "[ib]", 0.0);
                    double ie = nodeVoltages.getOrDefault("@q_" + id.toLowerCase() + "[ie]", 0.0);

                    result.put(id + "_ic", clean(ic));
                    result.put(id + "_ib", clean(ib));
                    result.put(id + "_ie", clean(ie));

                    String state;
                    if (vbe < 0.6) {
                        state = "CUTOFF";
                    } else if (vce < 0.2) {
                        state = "SATURATION";
                    } else {
                        state = "ACTIVE";
                    }

                    result.put(id + "_state", state);
                }

                default -> result.put(id, clean(voltage));
            }
        }

        return result;
    }

    private double clean(double value) {
        if (Math.abs(value) < 1e-6) return 0.0;

        double roundedInt = Math.round(value);
        if (Math.abs(value - roundedInt) < 1e-6) return roundedInt;

        return Math.round(value * 10000.0) / 10000.0;
    }

    private double getVoltage(String node, Map<String, Double> nodeVoltages) {
        if (node.equals("0")) return 0.0;
        return nodeVoltages.getOrDefault("v(" + node + ")", 0.0);
    }
}

