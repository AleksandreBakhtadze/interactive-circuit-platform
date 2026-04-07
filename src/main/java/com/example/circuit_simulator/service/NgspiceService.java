package com.example.circuit_simulator.service;

import java.nio.file.*;
import java.util.*;
import java.io.*;

public class NgspiceService {

    public static Map<String, Double> parse(String filePath) throws IOException {
        List<String> lines = Files.readAllLines(Paths.get(filePath));
        Map<String, Double> result = new HashMap<>();

        for (String line : lines) {
            line = line.trim();

            if (line.contains("=") && !line.startsWith("@") && !line.startsWith(".") && !line.startsWith("*")) {
                try {
                    String[] parts = line.split("=", 2);
                    String key = parts[0].trim().toLowerCase();
                    double value = Double.parseDouble(parts[1].trim());
                    if (!key.startsWith("v(") && !key.startsWith("i(") && !key.contains("#")) {
                        result.put("v(" + key + ")", value);
                    } else if (key.contains("#branch")) {
                        result.put(key, value);
                    }
                } catch (Exception ignored) {}
            }

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
        ProcessBuilder pb = new ProcessBuilder("ngspice", "-b", file);
        pb.redirectOutput(new File("output.txt"));
        pb.redirectErrorStream(true);

        Process process = pb.start();
        process.waitFor();
    }
}
