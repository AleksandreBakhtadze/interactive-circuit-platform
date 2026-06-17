package com.example.circuit_simulator.service;

import java.io.*;
import java.nio.file.*;
import java.util.*;

public class NgspiceService {

    /** Parsed ngspice wrdata columns: time plus one series per probe. */
    public record WrdataSeries(List<Double> time, List<List<Double>> probeValues) {}

    public static Map<String, Double> parse(String filePath) throws IOException {
        List<String> lines = Files.readAllLines(Paths.get(filePath));
        Map<String, Double> result = new HashMap<>();

        for (String line : lines) {
            line = line.trim();

            // Node voltages: "n1 = 3.000000e+00"
            if (line.contains("=") && !line.startsWith("@") && !line.startsWith(".") && !line.startsWith("*")) {
                try {
                    String[] parts = line.split("=", 2);
                    String key = parts[0].trim().toLowerCase();
                    double value = Double.parseDouble(parts[1].trim());
                    // Normalize to v(n1) format for consistency
                    if (!key.startsWith("v(") && !key.startsWith("i(") && !key.contains("#")) {
                        result.put("v(" + key + ")", value);
                    } else if (key.contains("#branch")) {
                        result.put(key, value);
                    }
                } catch (Exception ignored) {}
            }

            // Current readings: "@r_r1[i] = 1.5e-12"
            if (line.startsWith("@") && line.contains("=")) {
                try {
                    String[] parts = line.split("=", 2);
                    String key = parts[0].trim().toLowerCase(); // @r_r1[i]
                    double value = Double.parseDouble(parts[1].trim());
                    result.put(key, value);
                } catch (Exception ignored) {}
            }
        }

        return result;
    }

    public static String toJson(Map<String, ?> map) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");

        int i = 0;
        for (Map.Entry<String, ?> entry : map.entrySet()) {
            sb.append("  \"").append(entry.getKey()).append("\": ");

            Object value = entry.getValue();
            if (value instanceof String) {
                sb.append("\"").append(value).append("\"");
            } else {
                sb.append(value);
            }

            if (i < map.size() - 1) sb.append(",");
            sb.append("\n");
            i++;
        }

        sb.append("}");
        return sb.toString();
    }

    public static void runNgspice(String file) throws Exception {
        runNgspice(file, "output.txt");
    }

    public static void runNgspice(String circuitFile, String outputLog) throws Exception {
        ProcessBuilder pb = new ProcessBuilder("ngspice", "-b", circuitFile);
        pb.redirectOutput(new File(outputLog));
        pb.redirectErrorStream(true);

        Process process = pb.start();
        int exit = process.waitFor();
        if (exit != 0) {
            throw new RuntimeException("ngspice exited with code " + exit);
        }
    }

    /**
     * Parse wrdata ASCII export (without {@code time} in the wrdata vector list).
     * For N probes each row has 2N columns: time, val0, time, val1, …
     */
    public static WrdataSeries parseWrdata(String filePath, int probeCount) throws IOException {
        List<String> lines = Files.readAllLines(Paths.get(filePath));
        List<Double> time = new ArrayList<>();
        List<List<Double>> probeValues = new ArrayList<>();
        for (int i = 0; i < probeCount; i++) {
            probeValues.add(new ArrayList<>());
        }

        int minColumns = Math.max(2, probeCount * 2);

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) {
                continue;
            }
            String[] parts = line.split("\\s+");
            if (parts.length < minColumns) {
                continue;
            }
            try {
                time.add(Double.parseDouble(parts[0]));
                for (int i = 0; i < probeCount; i++) {
                    probeValues.get(i).add(Double.parseDouble(parts[2 * i + 1]));
                }
            } catch (NumberFormatException ignored) {
                /* skip malformed rows */
            }
        }

        return new WrdataSeries(time, probeValues);
    }
}