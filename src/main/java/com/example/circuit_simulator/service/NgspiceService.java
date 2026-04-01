package com.example.circuit_simulator.service;
import java.nio.file.*;
import java.util.*;
import java.io.*;

public class NgspiceService {
    public static Map<String, Double> parse(String filePath) throws IOException {
        List<String> lines = Files.readAllLines(Paths.get(filePath));
        Map<String, Double> result = new HashMap<>();
        boolean capture = false;

        for (String line : lines) {
            String trimmed = line.trim();

            // Start capturing after "Node Voltage" header
            if (trimmed.contains("Node") && trimmed.contains("Voltage")) {
                capture = true;
                continue;
            }

            if (!capture) continue;

            // Stop when we reach "Source Current" or empty section
            if (trimmed.isEmpty() || trimmed.contains("Source Current") || trimmed.contains("Source") && trimmed.contains("Current")) {
                break;
            }

            // Skip header separator lines like "---- -------"
            if (trimmed.contains("----") || trimmed.startsWith("Node") || trimmed.startsWith("----")) {
                continue;
            }

            String[] parts = trimmed.split("\\s+");
            // We expect at least 2 parts, and the second one should look like a number
            if (parts.length >= 2) {
                String node = parts[0];
                String valueStr = parts[1];

                try {
                    // Handle scientific notation like 6.666667e+00
                    double voltage = Double.parseDouble(valueStr);
                    result.put(node, voltage);
                } catch (NumberFormatException e) {
                    // Skip lines that still can't be parsed (extra safety)
                    continue;
                }
            }
        }
        return result;
    }

    public static String toJson(Map<String, Double> map) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");

        int i = 0;
        for (Map.Entry<String, Double> entry : map.entrySet()) {
            sb.append("  \"").append(entry.getKey()).append("\": ")
                    .append(entry.getValue());

            if (i < map.size() - 1) sb.append(",");
            sb.append("\n");
            i++;
        }

        sb.append("}");
        return sb.toString();
    }

    public static void runNgspice(String file) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("ngspice", "-b", file);
        pb.redirectOutput(new File("output.txt"));
        pb.redirectErrorStream(true);

        Process process = pb.start();
        process.waitFor();
    }
}
