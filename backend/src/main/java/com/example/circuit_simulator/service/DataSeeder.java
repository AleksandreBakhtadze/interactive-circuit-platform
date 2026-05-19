package com.example.circuit_simulator.service;

import com.example.circuit_simulator.model.Chapter;
import com.example.circuit_simulator.repository.ChapterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@Order(1)
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ChapterRepository chapterRepository;

    @Override
    public void run(String... args) {
        if (chapterRepository.count() > 0) return; // already seeded

        List<Chapter> chapters = List.of(
                new Chapter(null, "ST",  "გაცნობითი ამოცანები, მთავარი დეტალების გამოყენებით", "Introductory Challenges", 1),
                new Chapter(null, "LR",  "შუქდიოდები და რეზისტორები", "LEDs and Resistors", 2),
                new Chapter(null, "SW",  "გადამრთველი", "Switch", 3),
                new Chapter(null, "DM",  "მუდმივი დენის ძრავი", "DC Motor", 4),
                new Chapter(null, "VR",  "ცვლადი რეზისტორი", "Variable Resistor", 5),
                new Chapter(null, "CP",  "კონდენსატორი", "Capacitor", 6),
                new Chapter(null, "PR",  "ფოტორეზისტორი", "Photoresistor", 7),
                new Chapter(null, "DI",  "ნახევარგამტარული დიოდი", "Semiconductor Diode", 8),
                new Chapter(null, "TR",  "ტრანზისტორი", "Transistor", 9),
                new Chapter(null, "TRL", "ტრანზისტორის და რელეს ერთობლივი გამოყენება", "Transistor & Relay", 10),
                new Chapter(null, "TCP", "ტრანზისტორის და კონდენსატორის ერთობლივი გამოყენება", "Transistor & Capacitor", 11),
                new Chapter(null, "DTR", "დარლინგტონის წყვილის და ორი კასკადის გამოყენება", "Darlington Pair", 12),
                new Chapter(null, "TFB", "უკუკავშირი და ჰისტერეზისი", "Feedback & Hysteresis", 13),
                new Chapter(null, "TDM", "ტრანზისტორის და მუდმივი დენის ძრავის ერთობლივი გამოყენება", "Transistor & DC Motor", 14),
                new Chapter(null, "GEN", "ცვლადი სიგნალის გენერაცია", "Signal Generation", 15)
        );

        chapterRepository.saveAll(chapters);
        System.out.println("Chapters seeded.");
    }
}