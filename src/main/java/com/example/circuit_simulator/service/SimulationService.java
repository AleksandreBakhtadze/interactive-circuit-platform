package com.example.circuit_simulator.service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.nio.file.Files;
import java.nio.file.Paths;
import com.example.circuit_simulator.utils.SpiceGenerator;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class SimulationService {

    public String simulate(String circuitJson) {

        try {
            // 1. JSON → SPICE
            String spice = SpiceGenerator.generateSpice(circuitJson);

            // 2. write file
            Files.write(Paths.get("circuit.cir"), spice.getBytes());

            // 3. run ngspice
            NgspiceService.runNgspice("circuit.cir");

            // 4. parse output
            Map<String, Double> result =
                    NgspiceService.parse("output.txt");

            return NgspiceService.toJson(result);

        } catch (Exception e) {
            e.printStackTrace();
            return "{ \"error\": \"simulation failed\" }";
        }
    }
}
