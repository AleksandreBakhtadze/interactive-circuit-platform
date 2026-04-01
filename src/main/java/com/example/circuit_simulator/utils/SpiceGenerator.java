package com.example.circuit_simulator.utils;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

public class SpiceGenerator {

    public static String generateSpice(String json) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(json, Map.class);

        List<Map<String, Object>> components =
                (List<Map<String, Object>>) data.get("components");

        StringBuilder sb = new StringBuilder();

        sb.append("* auto-generated circuit\n");

        for (Map<String, Object> comp : components) {
            String id = (String) comp.get("id");
            String type = (String) comp.get("type");
            List<String> nodes = (List<String>) comp.get("nodes");
            String value = (String) comp.get("value");

            switch (type) {
                case "voltage":
                    sb.append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1))
                            .append(" DC ").append(value).append("\n");
                    break;

                case "resistor":
                    sb.append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append(value).append("\n");
                    break;

                case "lamp": // treat as resistor
                    sb.append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" 100\n");
                    break;

                case "switch":
                    // simple version: treat as resistor (closed = small resistance)
                    sb.append(id).append(" ")
                            .append(nodes.get(0)).append(" ")
                            .append(nodes.get(1)).append(" ")
                            .append("0.001\n");
                    break;
            }
        }

        sb.append("\n.op\n.end\n");

        return sb.toString();
    }
}