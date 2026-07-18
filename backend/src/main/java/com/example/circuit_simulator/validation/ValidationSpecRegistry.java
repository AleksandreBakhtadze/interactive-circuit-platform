package com.example.circuit_simulator.validation;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Declarative validation rules per problem.
 * Prefer rules (thresholds) over storing full golden voltage tables in DB.
 * Specs can later move to a {@code validation_spec} JSON column on Problem.
 */
@Component
public class ValidationSpecRegistry {

    private static final Map<String, ProblemValidationSpec> SPECS = Map.ofEntries(
            Map.entry("ST.L1.1", stL11()),
            Map.entry("ST.L1.2", stL12()),
            Map.entry("ST.L1.3", stL13()),
            Map.entry("ST.L1.5", stL15()),
            Map.entry("ST.L1.8", stL18()),
            Map.entry("ST.L2.4", stL24()),
            Map.entry("ST.L2.9", stL29()),
            Map.entry("ST.L2.10", stL210()),
            Map.entry("ST.L2.11", stL211()),
            Map.entry("ST.L2.12", stL212()),
            Map.entry("ST.L2.13", stL213()),
            Map.entry("ST.L2.14", stL214()),
            Map.entry("LR.L1.1", lrL11()),
            Map.entry("LR.L1.2", lrL12()),
            Map.entry("LR.L1.3", lrL13()),
            Map.entry("LR.L2.4", lrL24()),
            Map.entry("LR.L2.5", lrL25()),
            Map.entry("LR.L3.6", lrL36()),
            Map.entry("LR.L2.7", lrL27()),
            Map.entry("LR.L3.8", lrL38()),
            Map.entry("LR.L3.9", lrL39()),
            Map.entry("LR.L3.10", lrL310()),
            Map.entry("LR.L1.11", lrL111()),
            Map.entry("LR.L2.12", lrL212()),
            Map.entry("LR.L2.16", lrL216()),
            Map.entry("LR.L2.17", lrL217()),
            Map.entry("LR.L2.18", lrL218()),
            Map.entry("LR.L4.19", lrL419()),
            Map.entry("LR.L4.20", lrL420()),
            Map.entry("LR.L4.21", lrL421()),
            Map.entry("LR.L4.22", lrL422()),
            Map.entry("LR.L4.23", lrL423()),
            Map.entry("CP.L1.1", cpL11()),
            Map.entry("CP.L1.2", cpL12()),
            Map.entry("CP.L2.3", cpL23()),
            Map.entry("CP.L2.4", cpL24())
    );

    public Optional<ProblemValidationSpec> findByProblemCode(String problemCode) {
        return Optional.ofNullable(SPECS.get(problemCode));
    }

    private static ProblemValidationSpec stL11() {
        return new ProblemValidationSpec(
                "ST.L1.1",
                List.of(
                        new ValidationCase(
                                "button_pressed",
                                "ღილაკი დაჭერილი",
                                Map.of("button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.01)
                                )
                        ),
                        new ValidationCase(
                                "button_released",
                                "ღილაკი არ არის დაჭერილი",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        )
                )
        );
    }

    private static ProblemValidationSpec stL12() {
        return new ProblemValidationSpec(
                "ST.L1.2",
                List.of(
                        new ValidationCase(
                                "button_pressed",
                                "ღილაკი დაჭერილი",
                                Map.of("button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.01)
                                )
                        ),
                        new ValidationCase(
                                "button_released",
                                "ღილაკი არ არის დაჭერილი",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        )
                )
        );
    }

    private static ProblemValidationSpec stL13() {
        return new ProblemValidationSpec(
                "ST.L1.3",
                List.of(
                        new ValidationCase(
                                "switch_off_button_open",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_off_button_pressed",
                                "ჩამრთველი გამორთული, ღილაკი დაჭერილი",
                                Map.of("switch", "open", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open",
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.01)
                                )
                        )
                )
        );
    }

    private static ProblemValidationSpec stL15() {
        return new ProblemValidationSpec(
                "ST.L1.5",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_dimmed",
                                "ჩამრთველი ჩართული (ნათება შემცირებულია)",
                                Map.of("switch", "closed"),
                                List.of(
                                        // Must be lit, but dimmer than ~0.25 A baseline at 6 V (two 3 V packs).
                                        new ValidationCheck("lamp", "current", "gt", 0.01),
                                        new ValidationCheck("lamp", "current", "lt", 0.20)
                                )
                        )
                )
        );
    }

    private static ProblemValidationSpec stL18() {
        return new ProblemValidationSpec(
                "ST.L1.8",
                List.of(
                        new ValidationCase(
                                "switch_off_button_open",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_off_button_pressed",
                                "ჩამრთველი გამორთული, ღილაკი დაჭერილი",
                                Map.of("switch", "open", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open",
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        // Forward-biased LED: positive [id] well above reverse leakage.
                                        new ValidationCheck("led_1", "forward_current", "gt", 0.01)
                                )
                        )
                )
        );
    }

    /**
     * LR.L1.1 — two red LEDs + switch + button + one resistor + two supplies.
     * Accepts series or parallel LED wiring (lit_count does not care about topology).
     */
    private static ProblemValidationSpec lrL11() {
        return switchButtonBothLedsLit("LR.L1.1");
    }

    /** LR.L1.2 — same as L1.1 but one supply (parallel is the working solution). */
    private static ProblemValidationSpec lrL12() {
        return switchButtonBothLedsLit("LR.L1.2");
    }

    /**
     * LR.L1.3 — both LEDs lit with clearly different brightness (different series resistors).
     */
    private static ProblemValidationSpec lrL13() {
        return new ProblemValidationSpec(
                "LR.L1.3",
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Switch off, button pressed",
                                "ჩამრთველი გამორთული, ღილაკი დაჭერილი",
                                Map.of("switch", "open", "button_1", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Switch on, button open",
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Switch on, button pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 2),
                                        // 1k vs 5.1k → roughly 5×; require at least 2×.
                                        new ValidationCheck("leds", "current_ratio", "gt", 2.0)
                                )
                        )
                )
        );
    }

    /** LR.L2.4 — lamp || (R+LED), switch + button, two supplies. */
    private static ProblemValidationSpec lrL24() {
        return new ProblemValidationSpec(
                "LR.L2.4",
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001),
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "Switch off, button pressed",
                                "ჩამრთველი გამორთული, ღილაკი დაჭერილი",
                                Map.of("switch", "open", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001),
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "Switch on, button open",
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001),
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "Switch on, button pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.01),
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                )
                        )
                )
        );
    }

    /**
     * LR.L2.5 — independent branches: one button → lamp, other → LED; two supplies.
     * Independent branches: one button → lamp, other → LED; two supplies.
     * Button ↔ load mapping is tried both ways (placement order does not matter).
     */
    private static ProblemValidationSpec lrL25() {
        return new ProblemValidationSpec(
                "LR.L2.5",
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of(
                                        "switch", "open",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001),
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "Switch on, both buttons open",
                                "ჩამრთველი ჩართული, ღილაკები არ არის დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001),
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "Only first button pressed (lamp)",
                                "ჩართულია მხოლოდ პირველი ღილაკი — ნათურა",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.01),
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "Only second button pressed (LED)",
                                "ჩართულია მხოლოდ მეორე ღილაკი — შუქდიოდი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001),
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "Both buttons pressed",
                                "ჩამრთველი ჩართული, ორივე ღილაკი დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.01),
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                )
                        )
                )
        );
    }

    /** LR.L3.6 — LED is normally on; pressing the parallel bypass button turns it off. */
    private static ProblemValidationSpec lrL36() {
        return new ProblemValidationSpec(
                "LR.L3.6",
                List.of(
                        new ValidationCase(
                                "Button released",
                                "ღილაკი არ არის დაჭერილი",
                                Map.of("button_1", "open"),
                                List.of(new ValidationCheck(
                                        "led_1", "forward_current", "gt", 0.0001))
                        ),
                        new ValidationCase(
                                "Button pressed",
                                "ღილაკი დაჭერილი",
                                Map.of("button_1", "closed"),
                                List.of(new ValidationCheck(
                                        "led_1", "current", "lt", 0.0001))
                        )
                )
        );
    }

    /** LR.L2.7 — pressing the button increases LED current/brightness. */
    private static ProblemValidationSpec lrL27() {
        final String base = "Switch on, button released";
        return new ProblemValidationSpec(
                "LR.L2.7",
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(new ValidationCheck(
                                        "led_1", "current", "lt", 0.0001))
                        ),
                        new ValidationCase(
                                base,
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(new ValidationCheck(
                                        "led_1", "forward_current", "gt", 0.0001))
                        ),
                        new ValidationCase(
                                "Switch on, button pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი — ნათება მომატებულია",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(new ValidationCheck(
                                        "led_1",
                                        "forward_current",
                                        "gt_ref:" + base,
                                        1.25))
                        )
                )
        );
    }

    /** LR.L3.8 — pressing the resistive bypass button dims, but does not extinguish, LED. */
    private static ProblemValidationSpec lrL38() {
        final String base = "Switch on, button released";
        return new ProblemValidationSpec(
                "LR.L3.8",
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(new ValidationCheck(
                                        "led_1", "current", "lt", 0.0001))
                        ),
                        new ValidationCase(
                                base,
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(new ValidationCheck(
                                        "led_1", "forward_current", "gt", 0.0001))
                        ),
                        new ValidationCase(
                                "Switch on, button pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი — ნათება შემცირებულია",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0001),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current",
                                                "lt_ref:" + base,
                                                0.80)
                                )
                        )
                )
        );
    }

    /** LR.L3.9 — first button brightens; second button dims without extinguishing. */
    private static ProblemValidationSpec lrL39() {
        final String base = "Switch on, both buttons released";
        return new ProblemValidationSpec(
                "LR.L3.9",
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of(
                                        "switch", "open",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(new ValidationCheck(
                                        "led_1", "current", "lt", 0.0001))
                        ),
                        new ValidationCase(
                                base,
                                "ჩამრთველი ჩართული, ღილაკები არ არის დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(new ValidationCheck(
                                        "led_1", "forward_current", "gt", 0.0001))
                        ),
                        new ValidationCase(
                                "Only first button pressed",
                                "მხოლოდ პირველი ღილაკი — ნათება მომატებულია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "open"),
                                List.of(new ValidationCheck(
                                        "led_1",
                                        "forward_current",
                                        "gt_ref:" + base,
                                        1.25))
                        ),
                        new ValidationCase(
                                "Only second button pressed",
                                "მხოლოდ მეორე ღილაკი — ნათება შემცირებულია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0001),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current",
                                                "lt_ref:" + base,
                                                0.80)
                                )
                        )
                )
        );
    }

    /** LR.L3.10 — pressing one button makes one LED brighter and the other dimmer. */
    private static ProblemValidationSpec lrL310() {
        final String base = "Switch on, button released";
        return new ProblemValidationSpec(
                "LR.L3.10",
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                base,
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 2),
                                        new ValidationCheck(
                                                "leds",
                                                "led_min_forward_current",
                                                "gt",
                                                0.0001),
                                        new ValidationCheck(
                                                "leds",
                                                "led_max_forward_current",
                                                "gt",
                                                0.0001)
                                )
                        ),
                        new ValidationCase(
                                "Switch on, button pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი — ერთი იმატებს, მეორე იკლებს",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 2),
                                        // Shunt across one series LED: that LED drops a lot;
                                        // the other only rises a few % (1k + 1k reference).
                                        new ValidationCheck(
                                                "leds",
                                                "led_min_forward_current",
                                                "lt_ref:" + base,
                                                0.80),
                                        new ValidationCheck(
                                                "leds",
                                                "led_max_forward_current",
                                                "gt_ref:" + base,
                                                1.02),
                                        new ValidationCheck(
                                                "leds",
                                                "current_ratio",
                                                "gt",
                                                2.0)
                                )
                        )
                )
        );
    }

    /** LR.L1.11 — red and green LEDs in series, one resistor, two supplies. */
    private static ProblemValidationSpec lrL111() {
        return switchTwoLedsEqualBrightnessSpec("LR.L1.11", 1.15);
    }

    /** LR.L2.12 — independent red/green branches with resistors, one supply. */
    private static ProblemValidationSpec lrL212() {
        return switchTwoLedsEqualBrightnessSpec("LR.L2.12", 1.80);
    }

    /**
     * LR.L2.16 — condition only: idle → 0; one button → 1 lit; other button → 2 lit.
     * Button roles are tried both ways (placement order does not matter).
     */
    private static ProblemValidationSpec lrL216() {
        return new ProblemValidationSpec(
                "LR.L2.16",
                List.of(
                        new ValidationCase(
                                "No button pressed",
                                "ღილაკები არ არის დაჭერილი",
                                Map.of("button_1", "open", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Only first button pressed",
                                "მხოლოდ პირველი ღილაკი დაჭერილი — პირველი შუქდიოდი",
                                Map.of("button_1", "closed", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 1))
                        ),
                        new ValidationCase(
                                "Only second button pressed",
                                "მხოლოდ მეორე ღილაკი დაჭერილი — ორივე შუქდიოდი",
                                Map.of("button_1", "open", "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 2))
                        )
                )
        );
    }

    /**
     * LR.L2.17 — condition only: idle → both lit; one button → 1 lit; other → 0;
     * both pressed → 0. Button roles are tried both ways.
     */
    private static ProblemValidationSpec lrL217() {
        return new ProblemValidationSpec(
                "LR.L2.17",
                List.of(
                        new ValidationCase(
                                "No button pressed",
                                "ღილაკები არ არის დაჭერილი — ორივე ანთია",
                                Map.of("button_1", "open", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 2))
                        ),
                        new ValidationCase(
                                "Only first button pressed",
                                "მხოლოდ პირველი ღილაკი დაჭერილი — პირველი ჩაქრა",
                                Map.of("button_1", "closed", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 1))
                        ),
                        new ValidationCase(
                                "Only second button pressed",
                                "მხოლოდ მეორე ღილაკი დაჭერილი — ორივე ჩაქრა",
                                Map.of("button_1", "open", "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Both buttons pressed",
                                "ორივე ღილაკი დაჭერილი — ორივე ჩამქრალი",
                                Map.of("button_1", "closed", "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        )
                )
        );
    }

    /**
     * LR.L2.18 — green lights alone; pressing the button parallels a red LED that
     * steals the current (lower Vf), so green dims and red lights. Roles by color.
     */
    private static ProblemValidationSpec lrL218() {
        final String greenBase = "Switch on, button released";
        return new ProblemValidationSpec(
                "LR.L2.18",
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("led_green", "current", "lt", 0.0001),
                                        new ValidationCheck("led_red", "current", "lt", 0.0001)
                                )
                        ),
                        new ValidationCase(
                                greenBase,
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი — მწვანე ანთია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.0001),
                                        new ValidationCheck("led_red", "current", "lt", 0.0001)
                                )
                        ),
                        new ValidationCase(
                                "Switch on, button pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი — წითელი ანთია, მწვანე ჩაქრა",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.0001),
                                        // Green robbed of current: well below its solo brightness.
                                        new ValidationCheck(
                                                "led_green",
                                                "forward_current",
                                                "lt_ref:" + greenBase,
                                                0.5)
                                )
                        )
                )
        );
    }

    /**
     * LR.L4.19 — two series red LEDs on ONE supply (won't light together), each shunted
     * by a button. Pressing one button lights the other LED; both pressed → dark.
     * Order-independent via lit_count.
     */
    private static ProblemValidationSpec lrL419() {
        return new ProblemValidationSpec(
                "LR.L4.19",
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Switch on, no button",
                                "ჩამრთველი ჩართული, ღილაკები არ არის დაჭერილი — ორივე ჩამქრალი",
                                Map.of("switch", "closed", "button_1", "open", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Only first button pressed",
                                "მხოლოდ პირველი ღილაკი დაჭერილი",
                                Map.of("switch", "closed", "button_1", "closed", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 1))
                        ),
                        new ValidationCase(
                                "Only second button pressed",
                                "მხოლოდ მეორე ღილაკი დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open", "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 1))
                        ),
                        new ValidationCase(
                                "Both buttons pressed",
                                "ორივე ღილაკი დაჭერილი — ორივე ჩამქრალი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        )
                )
        );
    }

    /**
     * LR.L4.20 — like L4.19 but two supplies (use the mid-point). Both LEDs dark until
     * a single button routes current one way; both pressed → dark. Order-independent.
     */
    private static ProblemValidationSpec lrL420() {
        return new ProblemValidationSpec(
                "LR.L4.20",
                List.of(
                        new ValidationCase(
                                "No button pressed",
                                "ღილაკები არ არის დაჭერილი — ორივე ჩამქრალი",
                                Map.of("button_1", "open", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Only first button pressed",
                                "მხოლოდ პირველი ღილაკი დაჭერილი",
                                Map.of("button_1", "closed", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 1))
                        ),
                        new ValidationCase(
                                "Only second button pressed",
                                "მხოლოდ მეორე ღილაკი დაჭერილი",
                                Map.of("button_1", "open", "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 1))
                        ),
                        new ValidationCase(
                                "Both buttons pressed",
                                "ორივე ღილაკი დაჭერილი — ორივე ჩამქრალი",
                                Map.of("button_1", "closed", "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        )
                )
        );
    }

    /**
     * LR.L4.21 — reverse of L2.18: red lights alone; pressing the button parallels a
     * green LED on a divider tap that steals the current, so red dims and green lights.
     */
    private static ProblemValidationSpec lrL421() {
        final String redBase = "Switch on, button released";
        return new ProblemValidationSpec(
                "LR.L4.21",
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("led_red", "current", "lt", 0.0001),
                                        new ValidationCheck("led_green", "current", "lt", 0.0001)
                                )
                        ),
                        new ValidationCase(
                                redBase,
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი — წითელი ანთია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.0001),
                                        new ValidationCheck("led_green", "current", "lt", 0.0001)
                                )
                        ),
                        new ValidationCase(
                                "Switch on, button pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი — მწვანე ანთია, წითელი ჩაქრა",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.0001),
                                        new ValidationCheck(
                                                "led_red",
                                                "forward_current",
                                                "lt_ref:" + redBase,
                                                0.5)
                                )
                        )
                )
        );
    }

    /**
     * LR.L4.22 — two independent red+button branches; the green LED conducts only when
     * both buttons are pressed. One supply, no switch. Order-independent via lit_count.
     */
    private static ProblemValidationSpec lrL422() {
        return new ProblemValidationSpec(
                "LR.L4.22",
                List.of(
                        new ValidationCase(
                                "No button pressed",
                                "ღილაკები არ არის დაჭერილი — სამივე ჩამქრალი",
                                Map.of("button_1", "open", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Only first button pressed",
                                "მხოლოდ პირველი ღილაკი დაჭერილი — ერთი წითელი",
                                Map.of("button_1", "closed", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 1))
                        ),
                        new ValidationCase(
                                "Only second button pressed",
                                "მხოლოდ მეორე ღილაკი დაჭერილი — ერთი წითელი",
                                Map.of("button_1", "open", "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 1))
                        ),
                        new ValidationCase(
                                "Both buttons pressed",
                                "ორივე ღილაკი დაჭერილი — სამივე ანთია",
                                Map.of("button_1", "closed", "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 3))
                        )
                )
        );
    }

    /**
     * LR.L4.23 — like L4.22 scaled up: two supplies, series LED pairs. Build → 0 lit;
     * button 1 → red LEDs (2 lit); button 2 → green LEDs (2 lit); both → all 6 lit.
     * Order-independent (each single press lights two; both light six).
     */
    private static ProblemValidationSpec lrL423() {
        return new ProblemValidationSpec(
                "LR.L4.23",
                List.of(
                        new ValidationCase(
                                "No button pressed",
                                "ღილაკები არ არის დაჭერილი — ყველა ჩამქრალი",
                                Map.of("button_1", "open", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Only first button pressed",
                                "მხოლოდ პირველი ღილაკი დაჭერილი — წითლები",
                                Map.of("button_1", "closed", "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 2))
                        ),
                        new ValidationCase(
                                "Only second button pressed",
                                "მხოლოდ მეორე ღილაკი დაჭერილი — მწვანეები",
                                Map.of("button_1", "open", "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 2))
                        ),
                        new ValidationCase(
                                "Both buttons pressed",
                                "ორივე ღილაკი დაჭერილი — ყველა ანთია",
                                Map.of("button_1", "closed", "button_2", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 6))
                        )
                )
        );
    }

    private static ProblemValidationSpec switchTwoLedsEqualBrightnessSpec(
            String code,
            double maxCurrentRatio) {
        return new ProblemValidationSpec(
                code,
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Switch on",
                                "ჩამრთველი ჩართული — ორივე LED დაახლოებით თანაბრად ანთია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 2),
                                        new ValidationCheck(
                                                "leds",
                                                "current_ratio",
                                                "lte",
                                                maxCurrentRatio)
                                )
                        )
                )
        );
    }

    /** Switch + button: off cases → 0 LEDs lit; pressed → both LEDs lit. */
    private static ProblemValidationSpec switchButtonBothLedsLit(String code) {
        return new ProblemValidationSpec(
                code,
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Switch off, button pressed",
                                "ჩამრთველი გამორთული, ღილაკი დაჭერილი",
                                Map.of("switch", "open", "button_1", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Switch on, button open",
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Switch on, button pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 2))
                        )
                )
        );
    }

    /** ST.L2.9 — series red+green LEDs, switch + button, two supplies. */
    private static ProblemValidationSpec stL29() {
        return new ProblemValidationSpec(
                "ST.L2.9",
                List.of(
                        new ValidationCase(
                                "switch_off_button_open",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001),
                                        new ValidationCheck("led_2", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_off_button_pressed",
                                "ჩამრთველი გამორთული, ღილაკი დაჭერილი",
                                Map.of("switch", "open", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001),
                                        new ValidationCheck("led_2", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open",
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001),
                                        new ValidationCheck("led_2", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        // Two LEDs in series drop significant Vf; ~1 mA is visibly “on”.
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "gt", 0.001)
                                )
                        )
                )
        );
    }

    /** ST.L2.10 — series two buttons + red LED; both buttons required (like ST.L2.4). */
    private static ProblemValidationSpec stL210() {
        return new ProblemValidationSpec(
                "ST.L2.10",
                List.of(
                        new ValidationCase(
                                "switch_off_both_open",
                                "ჩამრთველი გამორთული",
                                Map.of(
                                        "switch", "open",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_both_open",
                                "ჩამრთველი ჩართული, ღილაკები არ არის დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button1_only",
                                "ჩართულია მხოლოდ პირველი ღილაკი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button2_only",
                                "ჩართულია მხოლოდ მეორე ღილაკი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_both_pressed",
                                "ჩამრთველი ჩართული, ორივე ღილაკი დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                )
                        )
                )
        );
    }

    /** ST.L2.11 — parallel two buttons + red LED; either button lights (OR). */
    private static ProblemValidationSpec stL211() {
        return new ProblemValidationSpec(
                "ST.L2.11",
                List.of(
                        new ValidationCase(
                                "switch_off_both_open",
                                "ჩამრთველი გამორთული",
                                Map.of(
                                        "switch", "open",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_both_open",
                                "ჩამრთველი ჩართული, ღილაკები არ არის დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("led_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button1_only",
                                "ჩართულია მხოლოდ პირველი ღილაკი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button2_only",
                                "ჩართულია მხოლოდ მეორე ღილაკი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_both_pressed",
                                "ჩამრთველი ჩართული, ორივე ღილაკი დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                )
                        )
                )
        );
    }

    /** ST.L2.12 — OR buttons; green + blue LEDs in series; two supplies. */
    private static ProblemValidationSpec stL212() {
        return orButtonsLitCountSpec("ST.L2.12", 2);
    }

    /**
     * ST.L2.13 — independent branches: button1 ↔ red, button2 ↔ blue.
     * Uses lit_count so placement order of LEDs does not matter.
     */
    private static ProblemValidationSpec stL213() {
        return independentBranchesLitCountSpec("ST.L2.13", 1);
    }

    /** ST.L2.14 — independent branches: 2 green / 2 blue; two supplies. */
    private static ProblemValidationSpec stL214() {
        return independentBranchesLitCountSpec("ST.L2.14", 2);
    }

    /** Parallel buttons (OR): either / both light exactly {@code litWhenOn} LEDs. */
    private static ProblemValidationSpec orButtonsLitCountSpec(String code, double litWhenOn) {
        return new ProblemValidationSpec(
                code,
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of(
                                        "switch", "open",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Switch on, both buttons open",
                                "ჩამრთველი ჩართული, ღილაკები არ არის დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Only first button pressed",
                                "ჩართულია მხოლოდ პირველი ღილაკი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", litWhenOn))
                        ),
                        new ValidationCase(
                                "Only second button pressed",
                                "ჩართულია მხოლოდ მეორე ღილაკი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", litWhenOn))
                        ),
                        new ValidationCase(
                                "Both buttons pressed",
                                "ჩამრთველი ჩართული, ორივე ღილაკი დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", litWhenOn))
                        )
                )
        );
    }

    /**
     * Independent button→LED branches: each button lights {@code perBranch} LEDs;
     * both buttons light {@code 2 * perBranch}.
     */
    private static ProblemValidationSpec independentBranchesLitCountSpec(
            String code, double perBranch) {
        return new ProblemValidationSpec(
                code,
                List.of(
                        new ValidationCase(
                                "Switch off",
                                "ჩამრთველი გამორთული",
                                Map.of(
                                        "switch", "open",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Switch on, both buttons open",
                                "ჩამრთველი ჩართული, ღილაკები არ არის დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(new ValidationCheck("leds", "lit_count", "eq", 0))
                        ),
                        new ValidationCase(
                                "Only first button pressed",
                                "ჩართულია მხოლოდ პირველი ღილაკი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", perBranch))
                        ),
                        new ValidationCase(
                                "Only second button pressed",
                                "ჩართულია მხოლოდ მეორე ღილაკი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", perBranch))
                        ),
                        new ValidationCase(
                                "Both buttons pressed",
                                "ჩამრთველი ჩართული, ორივე ღილაკი დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", 2 * perBranch))
                        )
                )
        );
    }

    private static ProblemValidationSpec stL24() {
        return new ProblemValidationSpec(
                "ST.L2.4",
                List.of(
                        new ValidationCase(
                                "switch_off_both_open",
                                "ჩამრთველი გამორთული",
                                Map.of(
                                        "switch", "open",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_both_open",
                                "ჩამრთველი ჩართული, ღილაკები არ არის დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button1_only",
                                "ჩართულია მხოლოდ პირველი ღილაკი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button2_only",
                                "ჩართულია მხოლოდ მეორე ღილაკი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_both_pressed",
                                "ჩამრთველი ჩართული, ორივე ღილაკი დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.01)
                                )
                        )
                )
        );
    }

    private static ProblemValidationSpec cpL11() {
        return new ProblemValidationSpec(
                "CP.L1.1",
                List.of(
                        new ValidationCase(
                                "button_open",
                                "ღილაკი არ არის დაჭერილი",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "button_pressed",
                                "ღილაკი დაჭერილი (მყისიერი ანთება)",
                                Map.of("button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.003)
                                )
                        ),
                        new ValidationCase(
                                "discharge_fade",
                                "ღილაკის გაშვების შემდეგ ნელი ჩაქრობა",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001)
                                ),
                                "discharge"
                        )
                )
        );
    }

    private static ProblemValidationSpec cpL12() {
        return new ProblemValidationSpec(
                "CP.L1.2",
                List.of(
                        new ValidationCase(
                                "button_open",
                                "ღილაკი არ არის დაჭერილი",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "slow_charge",
                                "ღილაკის დაჭერისას ნელი ანთება",
                                Map.of("button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_early",
                                                "lt",
                                                0.005),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.003)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "discharge_fade",
                                "ღილაკის გაშვების შემდეგ ნელი ჩაქრობა",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * CP.L2.3 — SPDT slide switch, green on left (A–B), red on right (A–C).
     * LED roles {@code led_green}/{@code led_red} are resolved by color, not placement order.
     */
    private static ProblemValidationSpec cpL23() {
        return new ProblemValidationSpec(
                "CP.L2.3",
                List.of(
                        new ValidationCase(
                                "slide_left_green_on",
                                "გადამრთველი A–B — მწვანე ანთებული",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.003),
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001)
                                ),
                                "idle"
                        ),
                        new ValidationCase(
                                "slide_right_crossfade",
                                "გადართვა A–C — მწვანე ნელა ქრება, წითელი ნელა ინთება",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_start",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_early",
                                                "lt",
                                                0.005),
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.003)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "slide_left_crossfade",
                                "გადართვა A–B — წითელი ნელა ქრება, მწვანე ნელა ინთება",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_start",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_early",
                                                "lt",
                                                0.005),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.003)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * CP.L2.4 — LED on at idle; button parallels discharged C across LED
     * (instant blackout, slow reclaim); release keeps LED on while C bleeds.
     * Thresholds use ~6 V (2×3 V) LED current (~2 mA), not the 12 V CP.L1.x rails.
     */
    private static ProblemValidationSpec cpL24() {
        return new ProblemValidationSpec(
                "CP.L2.4",
                List.of(
                        new ValidationCase(
                                "button_open",
                                "წრედის აწყობის შემდეგ შუქდიოდი ანთებულია",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0015)
                                )
                        ),
                        new ValidationCase(
                                "press_dip_reclaim",
                                "ღილაკის დაჭერისას მყისიერი ჩაქრობა და ნელი ანთება",
                                Map.of("button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_min",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_early_50ms",
                                                "lt",
                                                0.003),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.0015)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "release_led_stays_on",
                                "ღილაკის გაშვების შემდეგ შუქდიოდი რჩება ანთებული",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.0015)
                                ),
                                "discharge"
                        )
                )
        );
    }
}
