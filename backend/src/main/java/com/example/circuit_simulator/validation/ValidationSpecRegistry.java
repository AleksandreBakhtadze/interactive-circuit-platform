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
            Map.entry("CP.L2.4", cpL24()),
            Map.entry("CP.L2.8", cpL28()),
            Map.entry("CP.L2.9", cpL29()),
            Map.entry("CP.L2.13", cpL213()),
            Map.entry("CP.L2.14", cpL214()),
            Map.entry("CP.L2.15", cpL215()),
            Map.entry("CP.L2.16", cpL216()),
            Map.entry("CP.L4.19", cpL419()),
            Map.entry("SW.L1.1", swL11()),
            Map.entry("SW.L1.2", swL12()),
            Map.entry("SW.L1.13", swL113()),
            Map.entry("SW.L4.14", swL414()),
            Map.entry("SW.L2.3", swL23()),
            Map.entry("SW.L2.4", swL24()),
            Map.entry("SW.L2.5", swL25()),
            Map.entry("SW.L2.9", swL29()),
            Map.entry("SW.L2.10", swL210()),
            Map.entry("SW.L3.6", swL36()),
            Map.entry("SW.L3.7", swL37()),
            Map.entry("SW.L3.8", swL38()),
            Map.entry("SW.L3.11", swL311()),
            Map.entry("DI.L1.1", diL11()),
            Map.entry("DI.L2.2", diL22()),
            Map.entry("DI.L1.4", diL14()),
            Map.entry("DI.L3.6", diL36()),
            Map.entry("DI.L3.7", diL37()),
            Map.entry("DI.L4.8", diL48()),
            Map.entry("TR.L2.10", trL210()),
            Map.entry("TR.L2.11", trL211()),
            Map.entry("TR.L2.12", trL212()),
            Map.entry("TR.L2.13", trL213()),
            Map.entry("TR.L2.14", trL214()),
            Map.entry("TR.L2.16", trL216()),
            Map.entry("TR.L2.17", trL217()),
            Map.entry("TCP.L1.1", tcpL11()),
            Map.entry("TCP.L1.2", tcpL12()),
            Map.entry("TCP.L1.3", tcpL13()),
            Map.entry("TCP.L1.4", tcpL14()),
            Map.entry("TCP.L3.5", tcpL35()),
            Map.entry("DTR.L2.4", dtrL24()),
            Map.entry("DTR.L2.5", dtrL25()),
            Map.entry("DTR.L2.6", dtrL26()),
            Map.entry("DTR.L2.11", dtrL211()),
            Map.entry("DTR.L2.12", dtrL212()),
            Map.entry("GEN.L2.1", genL21()),
            Map.entry("GEN.L2.2", genL22()),
            Map.entry("GEN.L2.3", genL23()),
            Map.entry("GEN.L2.4", genL24()),
            Map.entry("GEN.L2.5", genL25()),
            Map.entry("TFB.L1.1", tfbL11()),
            Map.entry("TFB.L1.2", tfbL12()),
            Map.entry("TFB.L2.5", tfbL25()),
            Map.entry("TFB.L3.3", tfbL33()),
            Map.entry("TFB.L3.4", tfbL34()),
            Map.entry("TDM.L1.7", tdmL17()),
            Map.entry("TDM.L2.3", tdmL23()),
            Map.entry("TDM.L2.4", tdmL24()),
            Map.entry("TDM.L2.8", tdmL28()),
            Map.entry("TDM.L3.5", tdmL35()),
            Map.entry("DM.L1.1", dmL11()),
            Map.entry("DM.L2.2", dmL22()),
            Map.entry("DM.L2.3", dmL23()),
            Map.entry("DM.L2.5", dmL25()),
            Map.entry("DM.L2.6", dmL26()),
            Map.entry("DM.L2.7", dmL27()),
            Map.entry("DM.L2.8", dmL28()),
            Map.entry("DM.L3.9", dmL39()),
            Map.entry("DM.L2.10", dmL210()),
            Map.entry("DM.L3.11", dmL311()),
            Map.entry("DM.L2.13", dmL213()),
            Map.entry("VR.L1.1", vrL11()),
            Map.entry("VR.L1.2", vrL12()),
            Map.entry("VR.L1.3", vrL13()),
            Map.entry("VR.L1.4", vrL14()),
            Map.entry("VR.L1.5", vrL15()),
            Map.entry("VR.L2.6", vrL26()),
            Map.entry("VR.L2.7", vrL27()),
            Map.entry("VR.L2.8", vrL28()),
            Map.entry("VR.L2.9", vrL29()),
            Map.entry("VR.L2.12", vrL212()),
            Map.entry("VR.L2.13", vrL213()),
            Map.entry("VR.L2.15", vrL215()),
            Map.entry("VR.L3.19", vrL319()),
            Map.entry("VR.L1.20", vrL120()),
            Map.entry("VR.L3.22", vrL322()),
            Map.entry("VR.L4.23", vrL423()),
            Map.entry("PR.L1.1", prL11()),
            Map.entry("PR.L1.2", prL12()),
            Map.entry("PR.L1.5", prL15()),
            Map.entry("PR.L2.3", prL23()),
            Map.entry("PR.L2.4", prL24()),
            Map.entry("PR.L2.9", prL29()),
            Map.entry("PR.L3.10", prL310()),
            Map.entry("PR.L3.11", prL311())
    );

    public Optional<ProblemValidationSpec> findByProblemCode(String problemCode) {
        return Optional.ofNullable(SPECS.get(problemCode));
    }

    /**
     * DI.L1.1 — the forward diode feeds the lamp from the supply midpoint
     * (dim); the button connects the full rail directly to the lamp (bright).
     */
    private static ProblemValidationSpec diL11() {
        return new ProblemValidationSpec(
                "DI.L1.1",
                List.of(
                        new ValidationCase(
                                "button_open_dim",
                                "ღილაკი არ არის დაჭერილი — ნათურა სუსტად ანათებს",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.02),
                                        new ValidationCheck("lamp", "current", "lt", 0.09),
                                        new ValidationCheck(
                                                "diode_1", "forward_current", "gt", 0.02)
                                )
                        ),
                        new ValidationCase(
                                "button_pressed_bright",
                                "ღილაკი დაჭერილია — ნათურის ნათება მომატებულია",
                                Map.of("button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.08),
                                        new ValidationCheck(
                                                "lamp", "current_vs_prior", "gt", 1.5)
                                )
                        )
                )
        );
    }

    /**
     * DI.L2.2 — with the master switch on, two forward diodes reduce lamp
     * voltage slightly; the button bypasses both diodes for a modest increase.
     */
    private static ProblemValidationSpec diL22() {
        return new ProblemValidationSpec(
                "DI.L2.2",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open_dim",
                                "ჩამრთველი ჩართულია — ნათურა სუსტად ანათებს",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.08),
                                        new ValidationCheck(
                                                "diode_1", "forward_current", "gt", 0.02),
                                        new ValidationCheck(
                                                "diode_2", "forward_current", "gt", 0.02)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed_bright",
                                "ღილაკი დაჭერილია — ნათურის ნათება მომატებულია",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.1),
                                        new ValidationCheck(
                                                "lamp", "current_vs_prior", "gt", 1.08)
                                )
                        )
                )
        );
    }

    /**
     * DI.L1.4 — two red LEDs. Extra series diodes drop voltage on one LED so it
     * is dimmer; a button parallel to those diodes bypasses them and the two
     * LEDs equalize. Placement order of the LEDs must not matter.
     * No supply mid-tap is used as a load point.
     */
    private static ProblemValidationSpec diL14() {
        return new ProblemValidationSpec(
                "DI.L1.4",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — შუქდიოდები ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open_unequal",
                                "ჩამრთველი ჩართულია — ორივე ანთია, ერთი უფრო ძლიერად",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0003),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "gt", 0.0003),
                                        new ValidationCheck(
                                                "leds", "current_ratio", "gt", 1.3),
                                        // Remember the weaker LED current for the pressed case.
                                        new ValidationCheck(
                                                "leds", "led_min_forward_current", "gt", 0.0002)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed_equal",
                                "ღილაკი დაჭერილია — სუსტი შუქდიოდიც სრულად ანათებს",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.003),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "gt", 0.003),
                                        // Weak LED must brighten once diodes are bypassed.
                                        new ValidationCheck(
                                                "leds",
                                                "led_min_forward_current",
                                                "gt_ref:switch_on_button_open_unequal",
                                                1.3),
                                        // Currents should be close (equalized), not still 5× apart.
                                        new ValidationCheck(
                                                "leds", "current_ratio", "lt", 1.5)
                                )
                        )
                )
        );
    }

    /**
     * DI.L4.8 — diode bridge (2 diodes + 2 red LEDs as diodes) keeps green LED
     * forward-biased for either soft-wire polarity. Case 2 flips all packs.
     */
    private static ProblemValidationSpec diL48() {
        return new ProblemValidationSpec(
                "DI.L4.8",
                List.of(
                        new ValidationCase(
                                "supply_normal",
                                "წითელი (+), შავი (−) — მწვანე შუქდიოდი ანთია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "supply_reversed_green_on",
                                "წითელი და შავი გაცვლილი — მწვანე ისევ ანთია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.001)
                                )
                        )
                )
        );
    }

    /**
     * DI.L3.7 — diode-steered motor on a low-R mid-rail: motor spins one way for
     * either soft-wire polarity. Case 2 flips all voltage sources (external
     * red/black swap); signed current must stay the same direction
     * ({@code current_reversed_vs_prior} lt 0.5).
     */
    private static ProblemValidationSpec diL37() {
        return new ProblemValidationSpec(
                "DI.L3.7",
                List.of(
                        new ValidationCase(
                                "supply_normal",
                                "წითელი (+), შავი (−) — ძრავი ერთი მიმართულებით ტრიალებს",
                                Map.of(),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04)
                                )
                        ),
                        new ValidationCase(
                                "supply_reversed_same_spin",
                                "წითელი და შავი გაცვლილი — იგივე მიმართულება",
                                Map.of(),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "lt",
                                                0.5)
                                )
                        )
                )
        );
    }

    /**
     * DI.L3.6 — pot voltage divider drives two equal LED branches; one branch has a
     * diode+capacitor hold so brightening is synchronous but extinguishing is not.
     * Pot orientation is retried via CircuitValidationService invert.
     */
    private static ProblemValidationSpec diL36() {
        return new ProblemValidationSpec(
                "DI.L3.6",
                List.of(
                        new ValidationCase(
                                "pot_mid_equal",
                                "ცოცია შუაში — ორივე შუქდიოდი თითქმის ერთნაირად ანთია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "gt", 0.0002),
                                        new ValidationCheck("leds", "current_ratio", "lt", 5.0)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "pot_bright_sync",
                                "ცოცია ერთ ნაპირზე — ორივე ნათება სინქრონულად მატულობს",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "leds", "lit_forward_current_vs_prior", "gt", 1.2),
                                        new ValidationCheck("leds", "current_ratio", "lt", 5.0)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "pot_dim_async_hold",
                                "ცოცია მეორე ნაპირზე — ერთი სწრაფად ქრება, მეორე ჩამორჩება",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "leds",
                                                "tran_forward_current_start_max",
                                                "gt",
                                                0.0005),
                                        new ValidationCheck(
                                                "leds",
                                                "tran_forward_current_at_0.2_min",
                                                "lt",
                                                0.0005),
                                        new ValidationCheck(
                                                "leds",
                                                "tran_forward_current_at_0.2_max",
                                                "gt",
                                                0.0005)
                                ),
                                "discharge",
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * TR.L2.10 — collector load (common-emitter switch). Motor turns on abruptly:
     * once the pot lifts the base above Vbe, a short further move saturates the BJT.
     */
    private static ProblemValidationSpec trL210() {
        return new ProblemValidationSpec(
                "TR.L2.10",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ძრავი გაჩერებულია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_off",
                                "ჩამრთველი ჩართულია, ცოცია ნაპირზე — ძრავი გაჩერებულია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_mid_saturated",
                                "ცოცია შუა ზონაში — ძრავი უკვე თითქმის მაქსიმუმზეა",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.08)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_pot_max",
                                "ცოცია ბოლოში — სიჩქარე რჩება მაქსიმალური",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.1),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_vs_prior",
                                                "lt",
                                                1.4)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * TR.L2.11 — emitter follower. Motor voltage tracks the pot more gradually,
     * so mid-travel is still clearly below the full-travel current.
     */
    private static ProblemValidationSpec trL211() {
        return new ProblemValidationSpec(
                "TR.L2.11",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ძრავი გაჩერებულია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_off",
                                "ჩამრთველი ჩართულია, ცოცია ნაპირზე — ძრავი გაჩერებულია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_mid_partial",
                                "ცოცია შუაში — ძრავი უკვე ტრიალებს, მაგრამ ჯერ არა მაქსიმუმზე",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.02),
                                        new ValidationCheck("motor_1", "current", "lt", 0.16)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_pot_max",
                                "ცოცია ბოლოში — ძრავი მაქსიმალურ სიჩქარეზეა",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.08),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_vs_prior",
                                                "gt",
                                                1.35)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * TR.L2.12 — collector load lamp; quiescent base R (≥1k) lights dimly;
     * button parallels a second R (≥1k) to raise Ib and brighten.
     */
    private static ProblemValidationSpec trL212() {
        return new ProblemValidationSpec(
                "TR.L2.12",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open_dim",
                                "ჩამრთველი ჩართულია — ნათურა ანთია (სუსტად/საშუალოდ)",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.025),
                                        new ValidationCheck("lamp", "current", "lt", 0.105)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed_bright",
                                "ღილაკი დაჭერილია — ნათურის ნათება მოემატა",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.09),
                                        new ValidationCheck(
                                                "lamp", "current_vs_prior", "gt", 1.2)
                                )
                        )
                )
        );
    }

    /**
     * TR.L2.13 — emitter follower lamp; base at full V → bright; button closes
     * a divider to ~V/2 → dims.
     */
    private static ProblemValidationSpec trL213() {
        return new ProblemValidationSpec(
                "TR.L2.13",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open_bright",
                                "ჩამრთველი ჩართულია — ნათურა ძლიერად ანთია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.08)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed_dim",
                                "ღილაკი დაჭერილია — ნათურის ნათება მოიკლო",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.015),
                                        new ValidationCheck("lamp", "current", "lt", 0.075),
                                        new ValidationCheck(
                                                "lamp", "current_vs_prior", "lt", 0.75)
                                )
                        )
                )
        );
    }

    /**
     * TR.L2.14 — collector-load lamp biased by 100Ω + motor divider.
     * Motor spinning (high Rm) → lamp on; stalled (low Rm) → lamp off.
     */
    private static ProblemValidationSpec trL214() {
        return new ProblemValidationSpec(
                "TR.L2.14",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია",
                                Map.of("switch", "open", "motor_1", "running"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001),
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "running_lamp_on",
                                "ჩამრთველი ჩართულია, ძრავი ტრიალებს — ნათურა ანთია",
                                Map.of("switch", "closed", "motor_1", "running"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05),
                                        new ValidationCheck("motor_1", "current", "gt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "stalled_lamp_off",
                                "ძრავი მექანიკურად გაჩერებულია — ნათურა ჩამქრალია",
                                Map.of("switch", "closed", "motor_1", "stalled"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01),
                                        new ValidationCheck("motor_1", "current", "gt", 0.05)
                                )
                        )
                )
        );
    }

    /**
     * TR.L2.16 — antagonistic CE loads: pot drives motor BJT; lamp BJT base
     * taken from motor collector through 1k so motor-on ⇒ lamp-off and vice versa.
     */
    private static ProblemValidationSpec trL216() {
        return new ProblemValidationSpec(
                "TR.L2.16",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001),
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                ),
                                Map.of("variable_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "switch_on_motor_end",
                                "ცოცია ერთ ბოლოში — ძრავი ტრიალებს, ნათურა ჩამქრალია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.1),
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "switch_on_lamp_end",
                                "ცოცია მეორე ბოლოში — ნათურა ანთია, ძრავი გაჩერებულია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.08),
                                        new ValidationCheck("motor_1", "current", "lt", 0.04)
                                ),
                                Map.of("variable_resistor", 0.0)
                        )
                )
        );
    }

    /**
     * TR.L2.17 — AND: lamp lights only when both buttons are pressed
     * (series transistors, or series buttons into one transistor).
     */
    private static ProblemValidationSpec trL217() {
        return new ProblemValidationSpec(
                "TR.L2.17",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
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
                                "ჩამრთველი ჩართულია, ღილაკები არ არის დაჭერილი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "only_button_1",
                                "მხოლოდ პირველი ღილაკი დაჭერილია — ნათურა ჩამქრალია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "only_button_2",
                                "მხოლოდ მეორე ღილაკი დაჭერილია — ნათურა ჩამქრალია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "both_buttons",
                                "ორივე ღილაკი დაჭერილია — ნათურა ანთია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05)
                                )
                        )
                )
        );
    }

    /**
     * TCP.L1.1 — CE LED; button charges C; high-R base bleed keeps LED on for
     * several seconds after release, then fades out (long-hold discharge).
     */
    private static ProblemValidationSpec tcpL11() {
        return new ProblemValidationSpec(
                "TCP.L1.1",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — შუქდიოდი ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open",
                                "ჩამრთველი ჩართულია — შუქდიოდი ჩამქრალია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "button_pressed_instant_on",
                                "ღილაკი დაჭერილია — შუქდიოდი მყისიერად ანთია",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.003)
                                )
                        ),
                        new ValidationCase(
                                "release_hold_then_fade",
                                "ღილაკის გაშვების შემდეგ ნათება რამდენიმე წამი რჩება და ჩაქრება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.003),
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
     * TCP.L1.2 — LED || CE shunt; idle LED on; press charges C → BJT shunts LED off;
     * release holds dark then LED returns (long-hold discharge).
     */
    private static ProblemValidationSpec tcpL12() {
        return new ProblemValidationSpec(
                "TCP.L1.2",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — შუქდიოდი ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_led_on",
                                "ჩამრთველი ჩართულია — შუქდიოდი ანთია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.003)
                                )
                        ),
                        new ValidationCase(
                                "button_pressed_instant_off",
                                "ღილაკი დაჭერილია — შუქდიოდი მყისიერად ჩამქრალია",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "release_hold_off_then_on",
                                "ღილაკის გაშვების შემდეგ რამდენიმე წამი ჩამქრალია, შემდეგ ანთება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_1",
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
     * TCP.L1.3 — like L1.1 but lamp load: dual 470 µF || , CE switch, long hold after release.
     */
    private static ProblemValidationSpec tcpL13() {
        return new ProblemValidationSpec(
                "TCP.L1.3",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open",
                                "ჩამრთველი ჩართულია — ნათურა ჩამქრალია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "button_pressed_instant_on",
                                "ღილაკი დაჭერილია — ნათურა მყისიერად ანთია",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_early",
                                                "gt",
                                                0.05),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_end",
                                                "gt",
                                                0.05)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "release_hold_then_fade",
                                "ღილაკის გაშვების შემდეგ ნათება რამდენიმე წამი რჩება და ჩაქრება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_start",
                                                "gt",
                                                0.05),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.01)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * TCP.L3.5 — series capacitor into BJT base: DC hold (button open or closed) keeps
     * the lamp off; rapid button taps (simPhase {@code tapping}) couple enough base
     * current for the lamp to light.
     */
    private static ProblemValidationSpec tcpL35() {
        return new ProblemValidationSpec(
                "TCP.L3.5",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open",
                                "ჩამრთველი ჩართულია — ნათურა ჩამქრალია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "button_held_stays_off",
                                "ღილაკი დაჭერილია მუდმივად — ნათურა ჩამქრალია",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "rapid_tapping_lights",
                                "ღილაკზე სწრაფი პერიოდული დაჭერა — ნათურა ანთია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        // Sparse capacitive pulses: peak shows coupling; DC-held-off
                                        // already proved there is no steady base drive.
                                        new ValidationCheck(
                                                "lamp", "tran_current_abs_peak", "gt", 0.04)
                                ),
                                "tapping"
                        )
                )
        );
    }

    /**
     * DTR.L2.4 — Darlington emitter-follower + 1 µF: press spins motor; release holds
     * ≥10 s then fades (no resistors — high β + EF keeps base current tiny).
     */
    private static ProblemValidationSpec dtrL24() {
        return new ProblemValidationSpec(
                "DTR.L2.4",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ძრავი არ ტრიალებს",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open",
                                "ჩამრთველი ჩართულია — ძრავი არ ტრიალებს",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "button_pressed_spins",
                                "ღილაკი დაჭერილია — ძრავი ტრიალებს",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.08)
                                )
                        ),
                        new ValidationCase(
                                "release_hold_10s_then_stop",
                                "ღილაკის გაშვების შემდეგ ძრავი ≥10 წმ ტრიალებს და ჩერდება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_start",
                                                "gt",
                                                0.05),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_at_10",
                                                "gt",
                                                0.015),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.005)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * DTR.L2.5 — CE Darlington: high-R bias for slow idle; button + 10 µF + lower R for
     * fast spin; release returns to slow (kit: 510 kΩ rail→base, 10 kΩ boost).
     */
    private static ProblemValidationSpec dtrL25() {
        return new ProblemValidationSpec(
                "DTR.L2.5",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ძრავი გაჩერებულია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_slow",
                                "ჩამრთველი ჩართულია — ძრავი ძალიან ნელა ტრიალებს",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.008),
                                        new ValidationCheck("motor_1", "current", "lt", 0.08)
                                )
                        ),
                        new ValidationCase(
                                "button_pressed_fast",
                                "ღილაკი დაჭერილია — ძრავი სწრაფად ტრიალებს",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.15)
                                )
                        ),
                        new ValidationCase(
                                "release_then_slow",
                                "აშვების შემდეგ სიჩქარე იკლებს და ნელა რჩება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_start",
                                                "gt",
                                                0.15),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "gt",
                                                0.008),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.08)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * DTR.L2.6 — CE Darlington + 10 µF + ~1 MΩ base R (2×510 kΩ): idle off; press fast;
     * release holds ≥15 s then drops (CE snaps down; EF stays too high at end).
     */
    private static ProblemValidationSpec dtrL26() {
        return new ProblemValidationSpec(
                "DTR.L2.6",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ძრავი გაჩერებულია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_off",
                                "ჩამრთველი ჩართულია — ძრავი არ ტრიალებს",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "button_pressed_fast",
                                "ღილაკი დაჭერილია — ძრავი სწრაფად ტრიალებს",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.15)
                                )
                        ),
                        new ValidationCase(
                                "release_hold_15s_then_stop",
                                "აშვების შემდეგ ≥15 წმ სწრაფი ბრუნი, შემდეგ სწრაფად ჩერდება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_start",
                                                "gt",
                                                0.15),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_at_15",
                                                "gt",
                                                0.10),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.05)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * DTR.L2.11 — CE Darlington lamp; C+button ‖ B–E; charge via 2×100 kΩ.
     * Switch on → lamp on; press → instant off; release → on after ~2 s.
     */
    private static ProblemValidationSpec dtrL211() {
        return new ProblemValidationSpec(
                "DTR.L2.11",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_lamp_on",
                                "ჩამრთველი ჩართულია — ნათურა ანთია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05)
                                )
                        ),
                        new ValidationCase(
                                "button_pressed_off",
                                "ღილაკი დაჭერილია — ნათურა მყისიერად ჩაქრა",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "release_delayed_on",
                                "აშვების შემდეგ ნათურა ≥2 წმ-ში ანთდება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_start",
                                                "lt",
                                                0.01),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_at_1",
                                                "lt",
                                                0.05),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_end",
                                                "gt",
                                                0.05)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * DTR.L2.12 — CE delayed-on: button→100k→C→100k→base; release hold then fade.
     * Timing flexible (~2–5 s on); Darlington β tuned so this kit topology works.
     */
    private static ProblemValidationSpec dtrL212() {
        return new ProblemValidationSpec(
                "DTR.L2.12",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_lamp_off",
                                "ჩამრთველი ჩართულია — ნათურა ჩამქრალია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "press_delayed_on",
                                "ღილაკის დაჭერა — ნათურა შეყოვნებით ანთდება",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_start",
                                                "lt",
                                                0.02),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_early",
                                                "lt",
                                                0.05),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_end",
                                                "gt",
                                                0.05)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "release_hold_then_fade",
                                "აშვების შემდეგ ნათურა რჩება ანთებული და თანდათან ქრება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_start",
                                                "gt",
                                                0.05),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.05)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * TFB.L1.1 — CE Darlington lamp; pot divider → 1 kΩ → base.
     * Off at one end; abrupt brighten toward the other (on/off thresholds nearly coincide).
     */
    private static ProblemValidationSpec tfbL11() {
        return new ProblemValidationSpec(
                "TFB.L1.1",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_off",
                                "ჩამრთველი ჩართულია, ცოცია ნაპირზე — ნათურა ჩამქრალია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_mid_on",
                                "ცოცია შუა ზონაში — ნათურა უკვე ძლიერად ანთია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_pot_max",
                                "ცოცია ბოლოში — ნათურა მაქსიმალურად ანთია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05),
                                        new ValidationCheck(
                                                "lamp",
                                                "current_vs_prior",
                                                "lt",
                                                1.4)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * TFB.L1.2 — NPN CE drives PNP high-side; lamp on PNP collector.
     * Same pot behavior as L1.1; base↑ → PNP collector↑ (non-inverting overall).
     */
    private static ProblemValidationSpec tfbL12() {
        return new ProblemValidationSpec(
                "TFB.L1.2",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_off",
                                "ჩამრთველი ჩართულია, ცოცია ნაპირზე — ნათურა ჩამქრალია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_mid_on",
                                "ცოცია შუა ზონაში — ნათურა უკვე ძლიერად ანთია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_pot_max",
                                "ცოცია ბოლოში — ნათურა მაქსიმალურად ანთია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05),
                                        new ValidationCheck(
                                                "lamp",
                                                "current_vs_prior",
                                                "lt",
                                                1.4)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * TFB.L2.5 — two NPN inverting pair; intrinsic supply-sag positive feedback.
     * Lamp ON at the off-extreme wiper end; VBE rise snaps lamp OFF (reverse of L1.2).
     */
    private static ProblemValidationSpec tfbL25() {
        return new ProblemValidationSpec(
                "TFB.L2.5",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_on",
                                "ჩამრთველი ჩართულია, ცოცია ნაპირზე — ნათურა ანთია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "rising_near_on_stays_on",
                                "ცოცია ქვემოდან ოდნავ ასწიეთ — ნათურა ჯერ ანთია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05)
                                ),
                                Map.of("variable_resistor", 0.05),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "rising_snap_off",
                                "ცოცია შუაში ქვემოდან — ნათურა მყისიერად სრულად ჩაქრება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 0.5),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "falling_near_off_stays_off",
                                "ცოცია ზემოდან იგივე ზონაში — უკუკავშირი ნათურას ჩამქრალს ტოვებს",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 0.95),
                                Map.of("variable_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "falling_on",
                                "ცოცია ისევ ნაპირზე — ნათურა მყისიერად აინთება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05)
                                ),
                                Map.of("variable_resistor", 0.0),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * TFB.L3.3 — L1.2 complementary pair plus 1 kΩ positive feedback (NPN base ↔
     * PNP collector / lamp). Discrete snap on/off; structural feedback check in
     * CircuitValidationService. Hysteresis cases use prior-pot settle.
     */
    private static ProblemValidationSpec tfbL33() {
        return new ProblemValidationSpec(
                "TFB.L3.3",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_off",
                                "ჩამრთველი ჩართულია, ცოცია ნაპირზე — ნათურა ჩამქრალია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "rising_near_off_stays_off",
                                "ცოცია ქვემოდან ოდნავ ასწიეთ — ნათურა ჯერ ჩამქრალია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 0.05),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "rising_snap_on",
                                "ცოცია შუაში ქვემოდან — ნათურა მყისიერად სრულად ანთია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05)
                                ),
                                Map.of("variable_resistor", 0.5),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "falling_near_off_stays_on",
                                "ცოცია ზემოდან იგივე ზონაში — უკუკავშირი ნათურას ანთებულს ტოვებს",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05),
                                        new ValidationCheck(
                                                "lamp",
                                                "current_vs_prior",
                                                "lt",
                                                1.4)
                                ),
                                Map.of("variable_resistor", 0.05),
                                Map.of("variable_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "falling_off",
                                "ცოცია ისევ ნაპირზე — ნათურა მყისიერად ჩაქრება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 0.0),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * TFB.L3.4 — TFB.L3.3 latch held in the hysteresis band; button_1 forces ON,
     * button_2 forces OFF, and the lamp must hold after the button is released.
     */
    private static ProblemValidationSpec tfbL34() {
        return new ProblemValidationSpec(
                "TFB.L3.4",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open", "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                ),
                                Map.of("variable_resistor", 0.05)
                        ),
                        new ValidationCase(
                                "power_on_idle_off",
                                "ჩამრთველი ჩართულია — ნათურა ჩამქრალია",
                                Map.of("switch", "closed", "button_1", "open", "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                Map.of("variable_resistor", 0.05)
                        ),
                        new ValidationCase(
                                "press_set_on",
                                "პირველ ღილაკზე დაჭერა — ნათურა ანთია",
                                Map.of("switch", "closed", "button_1", "closed", "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05)
                                ),
                                null,
                                Map.of("variable_resistor", 0.05),
                                Map.of(),
                                Map.of(),
                                Map.of("switch", "closed", "button_1", "open", "button_2", "open")
                        ),
                        new ValidationCase(
                                "release_after_set_stays_on",
                                "პირველი ღილაკის გაშვება — ნათურა ანთებული რჩება",
                                Map.of("switch", "closed", "button_1", "open", "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.05),
                                        new ValidationCheck(
                                                "lamp",
                                                "current_vs_prior",
                                                "lt",
                                                1.4)
                                ),
                                null,
                                Map.of("variable_resistor", 0.05),
                                Map.of(),
                                Map.of(),
                                Map.of("switch", "closed", "button_1", "closed", "button_2", "open")
                        ),
                        new ValidationCase(
                                "press_reset_off",
                                "მეორე ღილაკზე დაჭერა — ნათურა ქრება",
                                Map.of("switch", "closed", "button_1", "open", "button_2", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                null,
                                Map.of("variable_resistor", 0.05),
                                Map.of(),
                                Map.of(),
                                Map.of("switch", "closed", "button_1", "closed", "button_2", "open")
                        ),
                        new ValidationCase(
                                "release_after_reset_stays_off",
                                "მეორე ღილაკის გაშვება — ნათურა ჩამქრალი რჩება",
                                Map.of("switch", "closed", "button_1", "open", "button_2", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.01)
                                ),
                                null,
                                Map.of("variable_resistor", 0.05),
                                Map.of(),
                                Map.of(),
                                Map.of("switch", "closed", "button_1", "open", "button_2", "closed")
                        )
                )
        );
    }

    /**
     * TCP.L1.4 — slow RC charge of dual 470 µF (high R_charge); lamp brightens gradually
     * on press, then fades faster on release (lower R_base bleed).
     */
    private static ProblemValidationSpec tcpL14() {
        return new ProblemValidationSpec(
                "TCP.L1.4",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open",
                                "ჩამრთველი ჩართულია — ნათურა ჩამქრალია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "press_slow_brighten",
                                "ღილაკის დაჭერა — ნათურა თანდათან ანთდება",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_start",
                                                "lt",
                                                0.02),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_early",
                                                "lt",
                                                0.03),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_end",
                                                "gt",
                                                0.05)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "release_faster_fade",
                                "ღილაკის გაშვება — ნათურა შედარებით ჩქარა ჩაქრება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_start",
                                                "gt",
                                                0.05),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.025),
                                        new ValidationCheck(
                                                "lamp",
                                                "tran_current_abs_fall",
                                                "gt",
                                                0.04)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * DM.L1.1 — series switch + button + motor (one supply).
     * Switch alone must not spin the motor; button press (with switch on) spins it.
     */
    private static ProblemValidationSpec dmL11() {
        return new ProblemValidationSpec(
                "DM.L1.1",
                List.of(
                        new ValidationCase(
                                "switch_off_button_open",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_off_button_pressed",
                                "ჩამრთველი გამორთული, ღილაკი დაჭერილი",
                                Map.of("switch", "open", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open",
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.01)
                                )
                        )
                )
        );
    }

    /**
     * DM.L2.2 — SPDT selects supply mid-tap (slow) vs full rail (fast).
     * Motor 50 Ω: ~0.12 A @ half V, ~0.24 A @ full V → ratio ≈ 2 (same topology as SW.L2.4).
     */
    private static ProblemValidationSpec dmL22() {
        return new ProblemValidationSpec(
                "DM.L2.2",
                List.of(
                        new ValidationCase(
                                "slide_left_slow",
                                "გადამრთველი A–B — ძრავი ტრიალებს ნელა",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck("motor_1", "current", "lt", 0.18)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_fast",
                                "გადამრთველი A–C — ძრავი ტრიალებს ჩქარა",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.15),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current",
                                                "gt_ref:slide_left_slow",
                                                1.5)
                                )
                        )
                )
        );
    }

    /**
     * DM.L2.3 — SPDT series R/lamp vs direct bypass (no supply mid-tap).
     * Motor 50 Ω @ 12 V: ~0.08 A with series 100 Ω/lamp, ~0.24 A direct (ratio ≈ 3).
     * Either throw may be the series path (matches kit DM.3A/B wiring either way).
     * Mid-tap half↔full is only ≈2× — rejected by the ratio floor.
     */
    private static ProblemValidationSpec dmL23() {
        return new ProblemValidationSpec(
                "DM.L2.3",
                List.of(
                        new ValidationCase(
                                "slide_left",
                                "გადამრთველი A–B — ძრავი ტრიალებს",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck("motor_1", "current", "lt", 0.30)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_different",
                                "გადამრთველი A–C — ბრუნვის სიჩქარე შესამჩნევად განსხვავებულია",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck("motor_1", "current", "lt", 0.30),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_vs_prior_ratio",
                                                "gt",
                                                2.2)
                                )
                        )
                )
        );
    }

    /**
     * DM.L2.5 — master SPST; motor runs; parallel button bypass stops the motor
     * (series lamp/R required so the button does not short the supply). Same idea as LR.L3.6.
     */
    private static ProblemValidationSpec dmL25() {
        return new ProblemValidationSpec(
                "DM.L2.5",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_running",
                                "ჩამრთველი ჩართული — ძრავი ტრიალებს",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.02)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_stops",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი — ძრავი გაჩერებულია",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        )
                )
        );
    }

    /**
     * TDM.L1.7 — complementary NPN+PNP emitter follower (half-bridge) driven by a pot
     * across dual-rail supplies; motor from emitters to mid-rail. Center → stop;
     * ends → opposite spin directions with |I| rising toward the rails.
     */
    private static ProblemValidationSpec tdmL17() {
        return new ProblemValidationSpec(
                "TDM.L1.7",
                List.of(
                        new ValidationCase(
                                "pot_center_stop",
                                "ცოცია ცენტრში — ძრავი გაჩერებულია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "pot_one_end_spin",
                                "ცოცია ერთ ნაპირზე — ძრავი ტრიალებს",
                                Map.of(),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "pot_other_end_reversed",
                                "ცოცია მეორე ნაპირზე — მიმართულება შეცვლილია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "gt",
                                                0.5)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * TDM.L2.8 — L1.7 half-bridge with CE NPN + 1 kΩ pull-up between pot and the
     * complementary bases so direction flips abruptly over a small wiper travel.
     */
    private static ProblemValidationSpec tdmL28() {
        return new ProblemValidationSpec(
                "TDM.L2.8",
                List.of(
                        new ValidationCase(
                                "pot_one_end_spin",
                                "ცოცია ერთ ნაპირზე — ძრავი ტრიალებს",
                                Map.of(),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "pot_other_end_reversed",
                                "ცოცია მეორე ნაპირზე — მიმართულება შეცვლილია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "gt",
                                                0.5)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * TDM.L2.3 — transistor H-bridge half (NPN–PNP / Darlington) + center tap
     * reverses motor like DM.L2.6, without a relay or resistive half-rail.
     */
    private static ProblemValidationSpec tdmL23() {
        return new ProblemValidationSpec(
                "TDM.L2.3",
                List.of(
                        new ValidationCase(
                                "slide_left",
                                "გადამრთველი A–B — ძრავი ტრიალებს",
                                Map.of("switch", "closed", "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_reversed",
                                "გადამრთველი A–C — ბრუნვის მიმართულება შეცვლილია",
                                Map.of("switch", "closed", "slide_switch", "right"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "gt",
                                                0.5)
                                )
                        )
                )
        );
    }

    /**
     * TDM.L2.4 — two-button reverse: idle stop; each button max spin opposite ways;
     * both pressed → stop. Master switch forced closed (submit sends switch open).
     */
    private static ProblemValidationSpec tdmL24() {
        return new ProblemValidationSpec(
                "TDM.L2.4",
                List.of(
                        new ValidationCase(
                                "idle_stop",
                                "ჩამრთველი ჩართულია, ღილაკები აშვებული — ძრავი გაჩერებულია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "button1_spin",
                                "პირველი ღილაკი — ძრავი ტრიალებს",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04)
                                )
                        ),
                        new ValidationCase(
                                "button2_reversed",
                                "მეორე ღილაკი — მიმართულება შეცვლილია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "gt",
                                                0.5)
                                )
                        ),
                        new ValidationCase(
                                "both_stop",
                                "ორივე ღილაკი — ძრავი გაჩერებულია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "button_2", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.02)
                                )
                        )
                )
        );
    }

    /**
     * TDM.L3.5 — one-button reverse: switch on → max spin one way; press → reverse max;
     * release → original direction. Master switch forced closed (submit sends switch open).
     */
    private static ProblemValidationSpec tdmL35() {
        return new ProblemValidationSpec(
                "TDM.L3.5",
                List.of(
                        new ValidationCase(
                                "idle_spin",
                                "ჩამრთველი ჩართულია, ღილაკი აშვებული — ძრავი ტრიალებს",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04)
                                )
                        ),
                        new ValidationCase(
                                "button_reversed",
                                "ღილაკი — ბრუნვის მიმართულება შეცვლილია",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "gt",
                                                0.5)
                                )
                        )
                )
        );
    }

    /**
     * DM.L2.6 — SPDT + dual-rail center tap reverses motor polarity.
     * Both throws spin (|I|≈0.12 @ ±6 V / 50 Ω); signed currents must flip.
     */
    private static ProblemValidationSpec dmL26() {
        return new ProblemValidationSpec(
                "DM.L2.6",
                List.of(
                        new ValidationCase(
                                "slide_left",
                                "გადამრთველი A–B — ძრავი ტრიალებს",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_reversed",
                                "გადამრთველი A–C — ბრუნვის მიმართულება შეცვლილია",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "gt",
                                                0.5)
                                )
                        )
                )
        );
    }

    /**
     * DM.L2.7 — same reverse-spin behavior as DM.L2.6, but mid-rail from equal-R divider
     * (no battery center tap). Low-R pair (e.g. 2×20 Ω) needed so |I| stays above floor.
     */
    private static ProblemValidationSpec dmL27() {
        return new ProblemValidationSpec(
                "DM.L2.7",
                List.of(
                        new ValidationCase(
                                "slide_left",
                                "გადამრთველი A–B — ძრავი ტრიალებს",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_reversed",
                                "გადამრთველი A–C — ბრუნვის მიმართულება შეცვლილია",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "gt",
                                                0.5)
                                )
                        )
                )
        );
    }

    /**
     * DM.L2.8 — two-SPDT H-bridge: same throws → spin; mismatched → stop;
     * both flipped → reverse. Full rail ≈12 V / 50 Ω → |I|≈0.24 A.
     */
    private static ProblemValidationSpec dmL28() {
        return new ProblemValidationSpec(
                "DM.L2.8",
                List.of(
                        new ValidationCase(
                                "both_left",
                                "ორივე გადამრთველი A–B — ძრავი ტრიალებს",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.1)
                                )
                        ),
                        new ValidationCase(
                                "both_right_reversed",
                                "ორივე გადამრთველი A–C — მიმართულება შეცვლილია",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.1),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "gt",
                                                0.5)
                                )
                        ),
                        new ValidationCase(
                                "mismatched_stop",
                                "გადამრთველები განსხვავებულ პოზიციაზე — ძრავი გაჩერებულია",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "mismatched_stop_other",
                                "გადამრთველები განსხვავებულ პოზიციაზე (სხვა წყვილი) — გაჩერებულია",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        )
                )
        );
    }

    /**
     * DM.L3.9 — center-tap reverse motor (like DM.L2.6) + anti-parallel red/green LEDs
     * across the motor (with series R). Either LED orientation OK: lit_set_changed.
     */
    private static ProblemValidationSpec dmL39() {
        return new ProblemValidationSpec(
                "DM.L3.9",
                List.of(
                        new ValidationCase(
                                "slide_left",
                                "გადამრთველი A–B — ძრავი ტრიალებს, ერთი შუქდიოდი ანთია",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_reversed",
                                "გადამრთველი A–C — მიმართულება შეცვლილია, მეორე შუქდიოდი ანთია",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "gt",
                                                0.5),
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "lit_set_changed", "gt", 0.0)
                                )
                        ),
                        new ValidationCase(
                                "slide_left_again",
                                "გადამრთველი უკან A–B — პირველი მიმართულება და პირველი შუქდიოდი",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_reversed_vs_prior",
                                                "gt",
                                                0.5),
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "lit_set_changed", "gt", 0.0)
                                )
                        )
                )
        );
    }

    /**
     * DM.L2.10 — series sense R (or lamp) ‖ (LED+R); motor running → LED off;
     * motor stalled (low Rm) → sense voltage lights LED. Uses motor state running/stalled.
     */
    private static ProblemValidationSpec dmL210() {
        return new ProblemValidationSpec(
                "DM.L2.10",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "motor_1", "running"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "running_led_off",
                                "ჩამრთველი ჩართული, ძრავი ტრიალებს — შუქდიოდი ჩამქრალი",
                                Map.of("switch", "closed", "motor_1", "running"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.01),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "stalled_led_on",
                                "ძრავი მექანიკურად გაჩერებული — შუქდიოდი ანთებული",
                                Map.of("switch", "closed", "motor_1", "stalled"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.08),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "running_again_led_off",
                                "ძრავი ისევ ტრიალებს — შუქდიოდი ჩამქრალი",
                                Map.of("switch", "closed", "motor_1", "running"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.01),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0005)
                                )
                        )
                )
        );
    }

    /**
     * DM.L3.11 — sense R ‖ (red+R) then motor ‖ (green+R).
     * Running: green on, red off. Stalled: red on, green off.
     * Sense should be ~100 Ω (not 20 Ω) so stalled V_motor stays below green Vf.
     */
    private static ProblemValidationSpec dmL311() {
        return new ProblemValidationSpec(
                "DM.L3.11",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "motor_1", "running"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "lt", 0.001),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0005),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "running_green_on",
                                "ძრავი ტრიალებს — მხოლოდ მწვანე ანთია",
                                Map.of("switch", "closed", "motor_1", "running"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.01),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.001),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "stalled_red_on",
                                "ძრავი გაჩერებული — მხოლოდ წითელი ანთია",
                                Map.of("switch", "closed", "motor_1", "stalled"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.001),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "running_again_green_on",
                                "ძრავი ისევ ტრიალებს — მწვანე ანთია, წითელი ჩამქრალი",
                                Map.of("switch", "closed", "motor_1", "running"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.01),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.001),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0005)
                                )
                        )
                )
        );
    }

    /**
     * DM.L2.13 — master SPST; slide_1 = mid-tap vs full rail; slide_2 = lamp vs motor.
     * Kit figure: load throw toward motor on one side, lamp on the other. Platform
     * slide left often selects motor (C) and right selects lamp (B) — match that;
     * CircuitValidationService also retries inverted load polarity.
     * Default 50 Ω motor (no stall state). Lamp ≈100 Ω.
     */
    private static ProblemValidationSpec dmL213() {
        return new ProblemValidationSpec(
                "DM.L2.13",
                List.of(
                        new ValidationCase(
                                "half_lamp",
                                "ჩამრთველი ჩართული — ნათურა სუსტად, ძრავი გაჩერებული",
                                Map.of(
                                        "switch", "closed",
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.03),
                                        new ValidationCheck("lamp", "current", "lt", 0.10),
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "full_lamp",
                                "პირველი გადამრთველი — ნათურის ნათება მომატებულია",
                                Map.of(
                                        "switch", "closed",
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.08),
                                        new ValidationCheck(
                                                "lamp", "current_vs_prior", "gt", 1.5),
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "full_motor",
                                "მეორე გადამრთველი — ძრავი ჩქარა, ნათურა ჩამქრალი",
                                Map.of(
                                        "switch", "closed",
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.15),
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "half_motor",
                                "პირველი უკან — ძრავის სიჩქარე შემცირებულია",
                                Map.of(
                                        "switch", "closed",
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck("motor_1", "current", "gt", 0.04),
                                        new ValidationCheck("motor_1", "current", "lt", 0.18),
                                        new ValidationCheck(
                                                "motor_1",
                                                "current_vs_prior_ratio",
                                                "gt",
                                                1.5),
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "half_lamp_again",
                                "მეორე უკან — ნათურა სუსტად, ძრავი გაჩერებული",
                                Map.of(
                                        "switch", "closed",
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.03),
                                        new ValidationCheck("lamp", "current", "lt", 0.10),
                                        new ValidationCheck("motor_1", "current", "lt", 0.001)
                                )
                        )
                )
        );
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
                                        // One 6 V pack + red LED + provided 1 kΩ resistor
                                        // yields about 4 mA. Require clear forward
                                        // conduction without rejecting the intended circuit.
                                        new ValidationCheck("led_1", "forward_current", "gt", 0.003)
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

    /**
     * CP.L2.8 — dual-rail SPDT, series motor + capacitor.
     * Idle: motor settles stopped. Each slide flip: brief |I| pulse then stop.
     * Opposite spin directions follow from polarity reversal (topology).
     */
    private static ProblemValidationSpec cpL28() {
        return new ProblemValidationSpec(
                "CP.L2.8",
                List.of(
                        new ValidationCase(
                                "idle_motor_stopped",
                                "წრედის აწყობის შემდეგ ძრავი გაჩერებულია",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.005)
                                ),
                                "idle"
                        ),
                        new ValidationCase(
                                "slide_right_pulse",
                                "გადართვა A–C — ძრავი მოკლედ ტრიალებს და ჩერდება",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_peak",
                                                "gt",
                                                0.02),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.005)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "slide_left_pulse",
                                "გადართვა A–B — ძრავი მოკლედ ტრიალებს საპირისპიროდ და ჩერდება",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        // Compare polarity to the previous (A–C) pulse before
                                        // abs_peak overwrites the remembered extremum.
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_flip_sign",
                                                "lt",
                                                0.0),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_peak",
                                                "gt",
                                                0.02),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.005)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * CP.L2.9 — 12 V H-bridge with two SPDTs, series motor + capacitor.
     * Matched throws: strong opposite pulses. Mismatched: weaker / no sustained spin.
     */
    private static ProblemValidationSpec cpL29() {
        return new ProblemValidationSpec(
                "CP.L2.9",
                List.of(
                        new ValidationCase(
                                "idle_both_left_stopped",
                                "ორივე გადამრთველი ერთნაირად — ძრავი გაჩერებულია",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.005)
                                ),
                                "idle"
                        ),
                        new ValidationCase(
                                "both_right_strong_pulse",
                                "ორივე გადართულია A–C — ძლიერი პულსი და გაჩერება",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_peak",
                                                "gt",
                                                0.28),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.005)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "both_left_opposite_pulse",
                                "ორივე უკან A–B — საპირისპირო ძლიერი პულსი და გაჩერება",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_flip_sign",
                                                "lt",
                                                0.0),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_peak",
                                                "gt",
                                                0.28),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.005)
                                ),
                                "discharge"
                        ),
                        new ValidationCase(
                                "only_slide1_right_weak",
                                "მხოლოდ ერთი გადამრთველი — სრული პულსი არ უნდა იყოს",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_peak",
                                                "lt",
                                                0.28),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.005)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "only_slide2_right_weak",
                                "მხოლოდ მეორე გადამრთველი — სრული პულსი არ უნდა იყოს",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_peak",
                                                "lt",
                                                0.28),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_end",
                                                "lt",
                                                0.005)
                                ),
                                "pressed"
                        )
                )
        );
    }

    /**
     * CP.L2.13 — soft-charge 470 µF across RGB LED branches (Vf order).
     * Press: red → green → blue. Release: blue → green → red.
     * Order uses {@code tran_lit_before:}/{@code tran_extinguish_before:} (Δt &gt; 0).
     */
    private static ProblemValidationSpec cpL213() {
        return new ProblemValidationSpec(
                "CP.L2.13",
                List.of(
                        new ValidationCase(
                                "button_open",
                                "ღილაკი არ არის დაჭერილი — ყველა LED ჩამქრალი",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.001),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.001),
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "slow_charge_rgb",
                                "ღილაკის დაჭერა — წითელი → მწვანე → ლურჯი",
                                Map.of("button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_start",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_start",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_blue",
                                                "tran_forward_current_start",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_lit_before:led_green",
                                                "gt",
                                                0.0),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_lit_before:led_blue",
                                                "gt",
                                                0.0),
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.00015),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.00015),
                                        new ValidationCheck(
                                                "led_blue",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.00015)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "discharge_rgb",
                                "ღილაკის გაშვება — ლურჯი → მწვანე → წითელი",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.00015),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.00015),
                                        new ValidationCheck(
                                                "led_blue",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.00015),
                                        new ValidationCheck(
                                                "led_blue",
                                                "tran_extinguish_before:led_green",
                                                "gt",
                                                0.0),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_extinguish_before:led_red",
                                                "gt",
                                                0.0),
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_blue",
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
     * CP.L2.14 — master SPST; dim LED via high R; button soft-charges C so
     * brightness rises gradually, then fades back to baseline on release.
     * Absolute currents vary (6 V/10 kΩ ≈ 0.4 mA vs 12 V/5.1 kΩ ≈ 2 mA); use
     * rise/fall and early/end ratio so both correct topologies pass.
     */
    private static ProblemValidationSpec cpL214() {
        return new ProblemValidationSpec(
                "CP.L2.14",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — შუქდიოდი ჩამქრალია",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "baseline_dim",
                                "ჩამრთველი ჩართულია — შუქდიოდი ანთებულია (საწყისი ნათება)",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002),
                                        // Cap at ~2.5 mA: allows 5.1 kΩ on 12 V rails.
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0025)
                                )
                        ),
                        new ValidationCase(
                                "press_gradual_brighten",
                                "ღილაკის დაჭერა — ნათება თანდათან იზრდება",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.0002),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "lt",
                                                0.0025),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_rise",
                                                "gt",
                                                0.00025),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_early_ratio",
                                                "lt",
                                                0.92)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "release_fade_to_baseline",
                                "ღილაკის გაშვება — ნათება თანდათან უბრუნდება საწყისს",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.0005),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_fall",
                                                "gt",
                                                0.00025),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.0002),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.0025)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * CP.L2.15 — dual soft-charge RC-LED branches; green must rise/fall faster than red
     * (typically smaller C on green). Uses lit/extinguish order metrics.
     */
    private static ProblemValidationSpec cpL215() {
        return new ProblemValidationSpec(
                "CP.L2.15",
                List.of(
                        new ValidationCase(
                                "button_open",
                                "ღილაკი არ არის დაჭერილი — ორივე LED ჩამქრალია",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.001),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "press_green_faster",
                                "ღილაკის დაჭერა — ორივე აინთება, მწვანე უფრო ჩქარა",
                                Map.of("button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_start",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_start",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_lit_before:led_red",
                                                "gt",
                                                0.0),
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.0005),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.0005)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "release_green_faster",
                                "ღილაკის გაშვება — ორივე ჩაქრება, მწვანე უფრო ჩქარა",
                                Map.of("button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.0005),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.0005),
                                        new ValidationCheck(
                                                "led_green",
                                                "tran_extinguish_before:led_red",
                                                "gt",
                                                0.0),
                                        new ValidationCheck(
                                                "led_red",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_green",
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
     * CP.L2.16 — SPDT selects half vs full series supply; RC softens LED brighten/fade.
     * Left (A–B) = lower voltage (lit dim); right (A–C) = higher (brighter).
     */
    private static ProblemValidationSpec cpL216() {
        return new ProblemValidationSpec(
                "CP.L2.16",
                List.of(
                        new ValidationCase(
                                "slide_left_baseline",
                                "გადამრთველი A–B — შუქდიოდი ანთებულია (საწყისი ნათება)",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.0002),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.0025)
                                ),
                                "idle"
                        ),
                        new ValidationCase(
                                "slide_right_gradual_brighten",
                                "გადართვა A–C — ნათება თანდათან იზრდება",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.0002),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_rise",
                                                "gt",
                                                0.00025),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_early_ratio",
                                                "lt",
                                                0.92),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.0008)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "slide_left_gradual_fade",
                                "გადართვა A–B — ნათება თანდათან მცირდება",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_start",
                                                "gt",
                                                0.0008),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_fall",
                                                "gt",
                                                0.00025),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "gt",
                                                0.0002),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.0025)
                                ),
                                "discharge"
                        )
                )
        );
    }

    /**
     * CP.L4.19 — dual-SPDT capacitor voltage doubler.
     * Both left: C charges across 2×3 V, series G+G+B+B dark.
     * Both right: C stacks with supply → brief LED pulse, then dark as C empties.
     */
    private static ProblemValidationSpec cpL419() {
        return new ProblemValidationSpec(
                "CP.L4.19",
                List.of(
                        new ValidationCase(
                                "idle_charge_leds_off",
                                "ორივე გადამრთველი A–B — კონდესატორი იტენება, LED-ები ჩამქრალია",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_4",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001)
                                ),
                                "idle"
                        ),
                        new ValidationCase(
                                "boost_pulse_leds_on",
                                "ორივე გადართულია A–C — ოთხივე LED მოკლედ აინთება",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_peak",
                                                "gt",
                                                0.0008),
                                        new ValidationCheck(
                                                "led_4",
                                                "tran_forward_current_peak",
                                                "gt",
                                                0.0008),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001)
                                ),
                                "pressed"
                        ),
                        new ValidationCase(
                                "return_charge_leds_off",
                                "ორივე უკან A–B — LED-ები ჩამქრალია (კონდესატორი ისევ იტენება)",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_end",
                                                "lt",
                                                0.001),
                                        new ValidationCheck(
                                                "led_4",
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
     * SW.L1.1 — SPDT selects between two red LEDs (DC).
     * One lit on A–B, the other on A–C (single shared R or two branch Rs both OK).
     */
    private static ProblemValidationSpec swL11() {
        return new ProblemValidationSpec(
                "SW.L1.1",
                List.of(
                        new ValidationCase(
                                "slide_left_one_led",
                                "გადამრთველი A–B — ანთებულია მხოლოდ ერთი შუქდიოდი",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_other_led",
                                "გადამრთველი A–C — ანთებულია მეორე შუქდიოდი",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "lit_set_changed", "gt", 0.0)
                                )
                        )
                )
        );
    }

    /**
     * SW.L1.2 — SPDT selects high-R vs low-R path into one LED (dim ↔ bright).
     * Either throw may be the dim side. Require ≥1.8× current change so
     * 1 kΩ↔5.1 kΩ and 5.1 kΩ↔10 kΩ pass; equal resistors (~1×) fail.
     */
    private static ProblemValidationSpec swL12() {
        return new ProblemValidationSpec(
                "SW.L1.2",
                List.of(
                        new ValidationCase(
                                "slide_left_lit",
                                "გადამრთველი A–B — შუქდიოდი ანთებულია",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_different_brightness",
                                "გადამრთველი A–C — ნათება შესამჩნევად განსხვავებულია",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.8)
                                )
                        )
                )
        );
    }

    /**
     * SW.L1.13 — SPDT mid-tap vs full rail; lamp ‖ (R+LED). Both loads dim↔bright together.
     * Either throw may be the dim (mid) side.
     */
    private static ProblemValidationSpec swL113() {
        return new ProblemValidationSpec(
                "SW.L1.13",
                List.of(
                        new ValidationCase(
                                "slide_left_both_lit",
                                "გადამრთველი A–B — ნათურა და შუქდიოდი ანთებულია",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp", "current", "gt", 0.02),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current",
                                                "gt",
                                                0.0005)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_brighter",
                                "გადამრთველი A–C — ორივეს ნათება განსხვავებულია",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp", "current", "gt", 0.02),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current",
                                                "gt",
                                                0.0005),
                                        new ValidationCheck(
                                                "lamp",
                                                "current_vs_prior_ratio",
                                                "gt",
                                                1.5),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.8)
                                )
                        )
                )
        );
    }

    /**
     * SW.L4.14 — SPDT mid vs full; lamp on common→GND, LED between full rail and common.
     * Left: lamp dim + LED bright; right: lamp bright + LED dim (inverse).
     */
    private static ProblemValidationSpec swL414() {
        return new ProblemValidationSpec(
                "SW.L4.14",
                List.of(
                        new ValidationCase(
                                "slide_left_inverse",
                                "გადამრთველი A–B — ნათურა სუსტად, შუქდიოდი ძლიერად",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp", "current", "gt", 0.02),
                                        new ValidationCheck(
                                                "lamp", "current", "lt", 0.09),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current",
                                                "gt",
                                                0.002)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_swapped",
                                "გადამრთველი A–C — ნათურა ძლიერად, შუქდიოდი სუსტად",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp", "current", "gt", 0.08),
                                        new ValidationCheck(
                                                "lamp",
                                                "current_vs_prior",
                                                "gt",
                                                1.5),
                                        // Inverse dimming — need not extinguish (divider / series-R variants).
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior",
                                                "lt",
                                                0.7)
                                )
                        )
                )
        );
    }

    /**
     * SW.L2.3 — one resistor; SPDT selects supply mid-tap (dim) vs full rail (bright).
     * Left (A–B) must be dimmer; right (A–C) ≥1.8× brighter.
     */
    private static ProblemValidationSpec swL23() {
        return new ProblemValidationSpec(
                "SW.L2.3",
                List.of(
                        new ValidationCase(
                                "slide_left_dim",
                                "გადამრთველი A–B — შუქდიოდი ანთებულია სუსტად",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.007)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_bright",
                                "გადამრთველი A–C — შუქდიოდის ნათება მომატებულია",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.002),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior",
                                                "gt",
                                                1.8)
                                )
                        )
                )
        );
    }

    /**
     * SW.L2.4 — lamp (no R); SPDT selects supply mid-tap (dim) vs full rail (bright).
     * 100 Ω model: ~60 mA @ half V, ~120 mA @ full V → ratio ≈ 2.
     */
    private static ProblemValidationSpec swL24() {
        return new ProblemValidationSpec(
                "SW.L2.4",
                List.of(
                        new ValidationCase(
                                "slide_left_dim",
                                "გადამრთველი A–B — ნათურა ანთებულია სუსტად",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.02),
                                        new ValidationCheck("lamp", "current", "lt", 0.09)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_bright",
                                "გადამრთველი A–C — ნათურის ნათება მომატებულია",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.08),
                                        new ValidationCheck(
                                                "lamp", "current_vs_prior", "gt", 1.5)
                                )
                        )
                )
        );
    }

    /**
     * SW.L2.5 — lamp + low-R on one throw, bypass on the other (no mid-tap).
     * 20 Ω + 100 Ω lamp @ 12 V: ~100 mA / ~120 mA (ratio ≈ 1.2).
     * Either throw may be the series-R path; both currents stay high (≥0.09)
     * so mid-tap-only (~60 mA) fails.
     */
    private static ProblemValidationSpec swL25() {
        return new ProblemValidationSpec(
                "SW.L2.5",
                List.of(
                        new ValidationCase(
                                "slide_left",
                                "გადამრთველი A–B — ნათურა ანთებულია (დაბალი R გზა)",
                                Map.of("slide_switch", "left"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.09),
                                        new ValidationCheck("lamp", "current", "lt", 0.125)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_different",
                                "გადამრთველი A–C — ნათება შესამჩნევად განსხვავებულია",
                                Map.of("slide_switch", "right"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.09),
                                        new ValidationCheck("lamp", "current", "lt", 0.125),
                                        new ValidationCheck(
                                                "lamp", "current_vs_prior_ratio", "gt", 1.12)
                                )
                        )
                )
        );
    }

    /**
     * SW.L2.9 — master SPST; baseline dim via 5.1 kΩ; button adds parallel boost R
     * selected by SPDT (10 kΩ weak / nearly same glow vs 1 kΩ strong).
     * Either throw may be the strong path.
     */
    private static ProblemValidationSpec swL29() {
        return new ProblemValidationSpec(
                "SW.L2.9",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — შუქდიოდი ჩამქრალია",
                                Map.of(
                                        "switch", "open",
                                        "button_1", "open",
                                        "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "baseline_dim",
                                "ჩამრთველი ჩართულია — შუქდიოდი ანთებულია სუსტად",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.004)
                                )
                        ),
                        new ValidationCase(
                                "press_boost_a",
                                "ღილაკი დაჭერილია (A–B) — ნათება მომატებულია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior",
                                                "gt",
                                                1.15)
                                )
                        ),
                        new ValidationCase(
                                "press_boost_b",
                                "ღილაკი დაჭერილია (A–C) — მომატება განსხვავებულია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.5)
                                )
                        )
                )
        );
    }

    /**
     * SW.L2.10 — master SPST; series R with button bypass for boost; SPDT selects
     * green vs blue LED. Either throw / either color orientation OK.
     */
    private static ProblemValidationSpec swL210() {
        return new ProblemValidationSpec(
                "SW.L2.10",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ორივე შუქდიოდი ჩამქრალია",
                                Map.of(
                                        "switch", "open",
                                        "button_1", "open",
                                        "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", 0.0)
                                )
                        ),
                        new ValidationCase(
                                "slide_left_dim",
                                "ჩამრთველი ჩართულია (A–B) — ერთი შუქდიოდი ანთებულია სუსტად",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds",
                                                "lit_forward_current",
                                                "gt",
                                                0.0003),
                                        new ValidationCheck(
                                                "leds",
                                                "lit_forward_current",
                                                "lt",
                                                0.004)
                                )
                        ),
                        new ValidationCase(
                                "slide_left_boost",
                                "ღილაკი დაჭერილია (A–B) — ნათება მომატებულია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds",
                                                "lit_forward_current_vs_prior",
                                                "gt",
                                                1.25)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_swap",
                                "გადამრთველი A–C — ანთებულია მეორე შუქდიოდი",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "open",
                                        "slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds",
                                                "lit_set_changed",
                                                "gt",
                                                0.0),
                                        new ValidationCheck(
                                                "leds",
                                                "lit_forward_current",
                                                "gt",
                                                0.0003),
                                        new ValidationCheck(
                                                "leds",
                                                "lit_forward_current",
                                                "lt",
                                                0.004)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_boost",
                                "ღილაკი დაჭერილია (A–C) — მეორე შუქდიოდის ნათება მომატებულია",
                                Map.of(
                                        "switch", "closed",
                                        "button_1", "closed",
                                        "slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds",
                                                "lit_forward_current_vs_prior",
                                                "gt",
                                                1.25)
                                )
                        )
                )
        );
    }

    /**
     * SW.L3.6 — reversible (3-way) lamp switch: two SPDTs, crossed or parallel travelers.
     * Toggling either switch must flip lamp on↔off. Initial state may be on or off.
     */
    private static ProblemValidationSpec swL36() {
        return new ProblemValidationSpec(
                "SW.L3.6",
                List.of(
                        new ValidationCase(
                                "both_left",
                                "ორივე გადამრთველი A–B — საწყისი მდგომარეობა",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "left"),
                                List.of()
                        ),
                        new ValidationCase(
                                "toggle_sw1",
                                "პირველი გადამრთველი გადაირთო — ნათურა შეიცვალა",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp", "lamp_lit_changed", "gt", 0.0)
                                )
                        ),
                        new ValidationCase(
                                "toggle_sw2",
                                "მეორე გადამრთველი გადაირთო — ნათურა შეიცვალა",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp", "lamp_lit_changed", "gt", 0.0)
                                )
                        ),
                        new ValidationCase(
                                "toggle_sw1_again",
                                "პირველი გადამრთველი კვლავ — ნათურა შეიცვალა",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp", "lamp_lit_changed", "gt", 0.0)
                                )
                        )
                )
        );
    }

    /**
     * SW.L3.7 — 3-way reversible path selects red LED in parallel with always-on green.
     * Red's lower Vf clamps the shared node so only one LED is lit; toggling either
     * SPDT swaps which LED is on.
     */
    private static ProblemValidationSpec swL37() {
        return new ProblemValidationSpec(
                "SW.L3.7",
                List.of(
                        new ValidationCase(
                                "both_left",
                                "ორივე გადამრთველი A–B — ანთებულია მხოლოდ ერთი შუქდიოდი",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0)
                                )
                        ),
                        new ValidationCase(
                                "toggle_sw1",
                                "პირველი გადამრთველი — შუქდიოდები შეიცვალა",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "lit_set_changed", "gt", 0.0)
                                )
                        ),
                        new ValidationCase(
                                "toggle_sw2",
                                "მეორე გადამრთველი — შუქდიოდები შეიცვალა",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "lit_set_changed", "gt", 0.0)
                                )
                        ),
                        new ValidationCase(
                                "toggle_sw1_again",
                                "პირველი გადამრთველი კვლავ — შუქდიოდები შეიცვალა",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "lit_set_changed", "gt", 0.0)
                                )
                        )
                )
        );
    }

    /**
     * SW.L3.8 — same as SW.L3.7 but both LEDs green; resistor divider raises the
     * always-on LED's effective drive so the switched LED can steal current.
     */
    private static ProblemValidationSpec swL38() {
        return new ProblemValidationSpec(
                "SW.L3.8",
                List.of(
                        new ValidationCase(
                                "both_left",
                                "ორივე გადამრთველი A–B — ანთებულია მხოლოდ ერთი შუქდიოდი",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0)
                                )
                        ),
                        new ValidationCase(
                                "toggle_sw1",
                                "პირველი გადამრთველი — შუქდიოდები შეიცვალა",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "left"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "lit_set_changed", "gt", 0.0)
                                )
                        ),
                        new ValidationCase(
                                "toggle_sw2",
                                "მეორე გადამრთველი — შუქდიოდები შეიცვალა",
                                Map.of(
                                        "slide_switch_1", "right",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "lit_set_changed", "gt", 0.0)
                                )
                        ),
                        new ValidationCase(
                                "toggle_sw1_again",
                                "პირველი გადამრთველი კვლავ — შუქდიოდები შეიცვალა",
                                Map.of(
                                        "slide_switch_1", "left",
                                        "slide_switch_2", "right"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "lit_set_changed", "gt", 0.0)
                                )
                        )
                )
        );
    }

    /**
     * SW.L3.11 — SPDT selects green vs blue; button parallels red (lower Vf) onto the
     * selected branch so red lights and the high-Vf LED extinguishes. Either throw
     * may host blue vs green. Red via button from SPDT common works on both throws.
     */
    private static ProblemValidationSpec swL311() {
        return new ProblemValidationSpec(
                "SW.L3.11",
                List.of(
                        new ValidationCase(
                                "slide_left_color",
                                "გადამრთველი A–B — ანთებულია ლურჯი ან მწვანე",
                                Map.of("button_1", "open", "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "led_red",
                                                "forward_current",
                                                "lt",
                                                0.0005)
                                )
                        ),
                        new ValidationCase(
                                "slide_right_swap",
                                "გადამრთველი A–C — მწვანე/ლურჯი შეიცვალა",
                                Map.of("button_1", "open", "slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds",
                                                "lit_set_changed",
                                                "gt",
                                                0.0),
                                        new ValidationCheck(
                                                "led_red",
                                                "forward_current",
                                                "lt",
                                                0.0005)
                                )
                        ),
                        new ValidationCase(
                                "press_right",
                                "ღილაკი დაჭერილია (A–C) — ერთი შუქდიოდი ანთებულია",
                                Map.of(
                                        "button_1", "closed",
                                        "slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "exclusive_red", "gte", 0.0)
                                )
                        ),
                        new ValidationCase(
                                "press_left",
                                "ღილაკი დაჭერილია (A–B) — ერთი შუქდიოდი ანთებულია",
                                Map.of(
                                        "button_1", "closed",
                                        "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "lit_count", "eq", 1.0),
                                        new ValidationCheck(
                                                "leds", "exclusive_red", "gte", 0.0),
                                        new ValidationCheck(
                                                "leds",
                                                "saw_exclusive_red",
                                                "gt",
                                                0.0)
                                )
                        )
                )
        );
    }

    /**
     * VR.L1.1 — SPST + pot (rheostat) + series R + red LED, two 3 V packs.
     * Either A–B or A–C rheostat wiring is valid: both pot extremes must light the LED,
     * with a clear brightness change between them (ratio either way).
     */
    private static ProblemValidationSpec vrL11() {
        return new ProblemValidationSpec(
                "VR.L1.1",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_min",
                                "ჩამრთველი ჩართული, ცოცია ერთ ნაპირზე",
                                Map.of("switch", "closed"),
                                List.of(
                                        // Dim end of A–C rheostat is ~0.35–0.5 mA with 1k + 6 V.
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_max",
                                "ჩამრთველი ჩართული, ცოცია მეორე ნაპირზე — ნათება იცვლება, არ ქრება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.8)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }
    /**
     * VR.L1.2 — pot as voltage divider + series R + parallel load R so LED can go fully off.
     * Pot orientation is tried both ways in CircuitValidationService.
     */
    private static ProblemValidationSpec vrL12() {
        return new ProblemValidationSpec(
                "VR.L1.2",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_bright",
                                "ჩამრთველი ჩართული, ცოცია — შუქდიოდი ანთებულია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_extinguished",
                                "ჩამრთველი ჩართული, ცოცია მეორე ნაპირზე — შუქდიოდი ჩაქრობილია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }
    /**
     * VR.L1.3 — series R into pot wiper; red on B, green on C (or swapped via pot invert).
     * Mid → both lit; each end favors one color.
     */
    private static ProblemValidationSpec vrL13() {
        return new ProblemValidationSpec(
                "VR.L1.3",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 0)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_mid",
                                "ჩამრთველი ჩართული, ცოცია შუაში — ორივე ანთებულია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck("leds", "lit_count", "eq", 2),
                                        // Red/green Vf differ — allow moderate mid imbalance.
                                        new ValidationCheck("leds", "current_ratio", "lt", 4.0)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_red",
                                "ცოცია ერთ ნაპირზე — წითელი ძლიერდება, მწვანე სუსტდება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.0015),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0006)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_green",
                                "ცოცია მეორე ნაპირზე — მწვანე ძლიერდება, წითელი სუსტდება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.0015),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0006)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * VR.L1.4 — master switch; full pot track feeds LED when button open (wiper ignored);
     * button closes wiper into circuit so pot position changes brightness.
     */
    private static ProblemValidationSpec vrL14() {
        return new ProblemValidationSpec(
                "VR.L1.4",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_button_open_a",
                                "ჩამრთველი ჩართული, ღილაკი გაშვებული — LED ანთებულია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_button_open_b",
                                "ღილაკი გაშვებული, ცოცია გადაადგილებული — ნათება არ იცვლება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "lt",
                                                1.35)
                                ),
                                Map.of("variable_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed_bright",
                                "ღილაკი დაჭერილი — ცოციით ნათება იცვლება (ძლიერი)",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0015)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed_dim",
                                "ღილაკი დაჭერილი, ცოცია მეორე ნაპირზე — ნათება შეიცვალა",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.8)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * VR.L1.5 — pot as rheostat in series with LED; button parallels (bypasses) the pot.
     * Button open → dial changes brightness; button pressed → bright, dial ignored.
     */
    private static ProblemValidationSpec vrL15() {
        return new ProblemValidationSpec(
                "VR.L1.5",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_button_open_a",
                                "ჩამრთველი ჩართული, ღილაკი გაშვებული — LED ანთებულია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_button_open_b",
                                "ღილაკი გაშვებული — ცოციით ნათება იცვლება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.8)
                                ),
                                Map.of("variable_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed_a",
                                "ღილაკი დაჭერილი — პოტი გადაილახება, LED ძლიერად ანათებს",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0015)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed_b",
                                "ღილაკი დაჭერილი, ცოცია გადაადგილებული — ნათება აღარ იცვლება",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "lt",
                                                1.35)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }
    /**
     * VR.L2.6 — series R into pot wiper; B and C shorted. Parallel halves → max R at mid
     * (dimmest LED); either end → brighter.
     */
    private static ProblemValidationSpec vrL26() {
        return new ProblemValidationSpec(
                "VR.L2.6",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_mid",
                                "ჩამრთველი ჩართული, ცოცია შუაში — მინიმალური ნათება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0003),
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0022)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_end_a",
                                "ცოცია ერთ ნაპირზე — ნათება მომატებულია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0025),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.5)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_end_b",
                                "ცოცია მეორე ნაპირზე — ნათება ისევ მომატებულია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0025),
                                        // Similar brightness to the other end (not mid).
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "lt",
                                                1.5)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }
    /**
     * VR.L2.7 — series R, then LED || pot (B and C shorted to ground, wiper at LED anode).
     * Mid → max shunt R → brightest LED; either end → near short → LED extinguishes.
     */
    private static ProblemValidationSpec vrL27() {
        return new ProblemValidationSpec(
                "VR.L2.7",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_mid",
                                "ჩამრთველი ჩართული, ცოცია შუაში — მაქსიმალური ნათება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_end_a",
                                "ცოცია ერთ ნაპირზე — ნათება მოიკლო და ჩაქრა",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_end_b",
                                "ცოცია მეორე ნაპირზე — ნათება ისევ ჩაქრობილია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * VR.L2.8 — like VR.L2.7 (LED || pot with B–C shorted) but series R in the shunt branch
     * so ends dim without extinguishing. Mid = brightest; either end = dimmer, still lit.
     */
    private static ProblemValidationSpec vrL28() {
        return new ProblemValidationSpec(
                "VR.L2.8",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_mid",
                                "ჩამრთველი ჩართული, ცოცია შუაში — მაქსიმალური ნათება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.002)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_end_a",
                                "ცოცია ერთ ნაპირზე — ნათება შემცირებულია, არ ქრება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior",
                                                "lt",
                                                0.85)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_end_b",
                                "ცოცია მეორე ნაპირზე — ნათება ისევ შემცირებულია, არ ქრება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "lt",
                                                1.5)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * VR.L2.9 — SPST + SPDT selects which pot end is powered; wiper feeds LED (+ series R).
     * Moving the pot changes brightness; flipping the SPDT reverses that direction
     * (same pot position changes brightness when the throw flips).
     */
    private static ProblemValidationSpec vrL29() {
        return new ProblemValidationSpec(
                "VR.L2.9",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "left_pot_a",
                                "ჩამრთველი ჩართული, გადამრთველი A–B — LED ანთებულია",
                                Map.of("switch", "closed", "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "left_pot_b",
                                "გადამრთველი A–B — ცოციით ნათება იცვლება",
                                Map.of("switch", "closed", "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.8)
                                ),
                                Map.of("variable_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "right_pot_b",
                                "გადამრთველი A–C — იმავე ცოციაზე ნათება შეიცვალა (მიმართულება შებრუნებულია)",
                                Map.of("switch", "closed", "slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.8)
                                ),
                                Map.of("variable_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "right_pot_a",
                                "გადამრთველი A–C — ცოციით ნათება ისევ იცვლება",
                                Map.of("switch", "closed", "slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.8)
                                ),
                                Map.of("variable_resistor", 0.0)
                        )
                )
        );
    }

    /**
     * VR.L2.12 — two pots as series rheostats (wiper–end free ends joined), then series R + red LED.
     * Either pot alone or both moved together must change LED brightness.
     */
    private static ProblemValidationSpec vrL212() {
        return new ProblemValidationSpec(
                "VR.L2.12",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.5,
                                        "variable_resistor_2", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_aligned",
                                "ჩამრთველი ჩართული, ცოციები გასწორებული — LED ანთებულია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.5,
                                        "variable_resistor_2", 0.5)
                        ),
                        new ValidationCase(
                                "one_pot_moved",
                                "ერთი ცოცია გადაადგილებული — ნათება იცვლება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.4)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.0,
                                        "variable_resistor_2", 0.5)
                        ),
                        new ValidationCase(
                                "other_pot_moved",
                                "მეორე ცოციაც გადაადგილებული — ნათება ისევ იცვლება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.35)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.0,
                                        "variable_resistor_2", 0.0)
                        ),
                        // Not (1,1) after (0,0): mirrored pot orientation makes those
                        // totals equal (R(p)+R(1-p)=Rmax). Move both wipers to a pair
                        // that always changes series R either way.
                        new ValidationCase(
                                "both_synced",
                                "ორივე ცოცია გადაადგილებული — ნათება იცვლება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.35)
                                ),
                                Map.of(
                                        "variable_resistor_1", 1.0,
                                        "variable_resistor_2", 0.5)
                        )
                )
        );
    }

    /**
     * VR.L2.13 — two pots as series rheostats on opposite track ends (wiper–B and wiper–C),
     * then series R + red LED. Moving either pot changes brightness; moving both to the
     * same wiper position keeps total R ≈ constant (brightness unchanged).
     */
    private static ProblemValidationSpec vrL213() {
        return new ProblemValidationSpec(
                "VR.L2.13",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.5,
                                        "variable_resistor_2", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_aligned",
                                "ჩამრთველი ჩართული, ცოციები გასწორებული — LED ანთებულია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.5,
                                        "variable_resistor_2", 0.5)
                        ),
                        // prior = switch_on_aligned (0.5/0.5). Move VR1 alone to 0.0
                        // → R1 drops, so more current → brighter.
                        new ValidationCase(
                                "one_pot_moved",
                                "ერთი ცოცია გადაადგილებული — ნათება იცვლება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.35)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.0,
                                        "variable_resistor_2", 0.5)
                        ),
                        // prior = one_pot_moved (0.0/0.5). Move VR2 alone to 0.0.
                        new ValidationCase(
                                "other_pot_moved",
                                "მეორე ცოციაც გადაადგილებული — ნათება ისევ იცვლება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.2)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.0,
                                        "variable_resistor_2", 0.0)
                        ),
                        // Synced move: cross-wired pots. (p, 1-p) keeps total R constant.
                        // We use gt_ref / lt_ref against the switch_on_aligned measurement
                        // (0.5/0.5) so the prior-chain doesn't matter.
                        // forward_current at (1.0, 0.0) ≈ forward_current at (0.5, 0.5):
                        // must be within ±30% of aligned brightness.
                        new ValidationCase(
                                "both_synced",
                                "ორივე ცოცია სინქრონულად გადაადგილებული — ნათება არ იცვლება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current",
                                                "gt_ref:switch_on_aligned",
                                                0.7),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current",
                                                "lt_ref:switch_on_aligned",
                                                1.3)
                                ),
                                Map.of(
                                        "variable_resistor_1", 1.0,
                                        "variable_resistor_2", 0.0)
                        )
                )
        );
    }

    /**
     * VR.L2.15 — 1 kΩ + RV1 series rheostat (master brightness), then RV2 divider
     * between two red LEDs (balance). RV1 moves both together; RV2 favors one LED.
     */
    private static ProblemValidationSpec vrL215() {
        return new ProblemValidationSpec(
                "VR.L2.15",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "lt", 0.0005)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.5,
                                        "variable_resistor_2", 0.5)
                        ),
                        new ValidationCase(
                                "switch_on_mid",
                                "ჩამრთველი ჩართული, ორივე ცოცია შუაში — ორივე შუქდიოდი ანთებულია",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "leds", "current_ratio", "lt", 4.0)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.5,
                                        "variable_resistor_2", 0.5)
                        ),
                        new ValidationCase(
                                "pot1_master_moved",
                                "პირველი ცვლადი რეზისტორი — ორივე შუქდიოდის ნათება იცვლება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.35),
                                        new ValidationCheck(
                                                "led_2",
                                                "forward_current",
                                                "gt_ref:switch_on_mid",
                                                1.25)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.0,
                                        "variable_resistor_2", 0.5)
                        ),
                        new ValidationCase(
                                "pot2_favor_led1",
                                "მეორე ცვლადი რეზისტორი — პირველი შუქდიოდი ძლიერდება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00055),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "lt", 0.0001)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.5,
                                        "variable_resistor_2", 0.0)
                        ),
                        new ValidationCase(
                                "pot2_favor_led2",
                                "მეორე ცვლადი რეზისტორი — მეორე შუქდიოდი ძლიერდება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_2", "forward_current", "gt", 0.00055),
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0001)
                                ),
                                Map.of(
                                        "variable_resistor_1", 0.5,
                                        "variable_resistor_2", 1.0)
                        )
                )
        );
    }

    /**
     * VR.L3.19 — pot as voltage divider between two supply rails; anti-parallel red+green
     * LEDs between wiper and mid-rail (no switch). Mid position → both off.
     * Moving toward B → green forward-biased; toward C → red forward-biased.
     * Pot invert retry handles either LED placement order.
     */
    private static ProblemValidationSpec vrL319() {
        return new ProblemValidationSpec(
                "VR.L3.19",
                List.of(
                        new ValidationCase(
                                "pot_mid_both_off",
                                "ცოცია შუაში — ორივე შუქდიოდი ჩამქრალია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0003),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0003)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "pot_one_end_green",
                                "ცოცია ერთ ნაპირზე — მწვანე შუქდიოდი ანთებულია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.0003),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0001)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "pot_other_end_red",
                                "ცოცია მეორე ნაპირზე — წითელი შუქდიოდი ანთებულია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.0003),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0001)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * VR.L1.20 — same antiparallel LED behavior as VR.L3.19 but mid-rail is derived
     * from two equal series resistors (voltage divider) between +6V and GND, rather
     * than the battery center-tap. Validation cases are identical.
     */
    private static ProblemValidationSpec vrL120() {
        return new ProblemValidationSpec(
                "VR.L1.20",
                List.of(
                        new ValidationCase(
                                "pot_mid_both_off",
                                "ცოცია შუაში — ორივე შუქდიოდი ჩამქრალია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0003),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0003)
                                ),
                                Map.of("variable_resistor", 0.5)
                        ),
                        new ValidationCase(
                                "pot_one_end_green",
                                "ცოცია ერთ ნაპირზე — მწვანე შუქდიოდი ანთებულია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0001)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "pot_other_end_red",
                                "ცოცია მეორე ნაპირზე — წითელი შუქდიოდი ანთებულია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0001)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * VR.L3.22 — pot wiper feeds RGB branches (10k/5.1k/1k per color); bottom track
     * through 1k to GND. Switch on, pot at start → all off; increasing wiper → red,
     * then green, then blue. Pot invert handles reversed track wiring.
     */
    private static ProblemValidationSpec vrL322() {
        return new ProblemValidationSpec(
                "VR.L3.22",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული — ყველა შუქდიოდი ჩამქრალია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0002),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0002),
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "lt", 0.0002)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_start",
                                "ჩამრთველი ჩართული, ცოცია დასაწყისში — არცერთი არ ანთება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0002),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0002),
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "lt", 0.0002)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_red_only",
                                "ცოციის გადაადგილება — ჯერ წითელი ანთება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.00012),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0001),
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "lt", 0.0001)
                                ),
                                Map.of("variable_resistor", 0.38)
                        ),
                        new ValidationCase(
                                "switch_on_red_green",
                                "ცოციის გადაადგილება — წითელი და მწვანე ანთება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.00005),
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "lt", 0.0001)
                                ),
                                Map.of("variable_resistor", 0.58)
                        ),
                        new ValidationCase(
                                "switch_on_all_rgb",
                                "ცოცია მაქსიმუმზე — სამივე შუქდიოდი ნათლად ანთება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "gt", 0.00025)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * VR.L4.23 — BGR via divider taps (blue→high, green→mid, red→low). Pot at 0 → all
     * off; increasing toward 1 → blue, then green, then red; at 1 all lit clearly.
     */
    private static ProblemValidationSpec vrL423() {
        return new ProblemValidationSpec(
                "VR.L4.23",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული — ყველა შუქდიოდი ჩამქრალია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0002),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0002),
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "lt", 0.0002)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_pot_start",
                                "ჩამრთველი ჩართული, ცოცია დასაწყისში — არცერთი არ ანთება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0002),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0002),
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "lt", 0.0002)
                                ),
                                Map.of("variable_resistor", 0.0)
                        ),
                        new ValidationCase(
                                "switch_on_blue_only",
                                "ცოციის გადაადგილება — ჯერ ლურჯი ანთება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "gt", 0.00002),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.00008),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.00008)
                                ),
                                Map.of("variable_resistor", 0.42)
                        ),
                        new ValidationCase(
                                "switch_on_blue_green",
                                "ცოციის გადაადგილება — ლურჯი და მწვანე ანთება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "gt", 0.00008),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.00008),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.000001)
                                ),
                                Map.of("variable_resistor", 0.62)
                        ),
                        new ValidationCase(
                                "switch_on_all_bgr",
                                "ცოცია მაქსიმუმზე — სამივე შუქდიოდი ნათლად ანთება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_blue", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.0002)
                                ),
                                Map.of("variable_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * PR.L1.1 — switch + photoresistor + series R + red LED, two 6 V packs (series).
     * Torch / cover simulated via {@code lightLevels} on {@code photo_resistor}.
     */
    private static ProblemValidationSpec prL11() {
        return new ProblemValidationSpec(
                "PR.L1.1",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_ambient",
                                "ჩამრთველი ჩართული — ნათელი",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00008)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.352)
                        ),
                        new ValidationCase(
                                "switch_on_torch",
                                "ფანრით დატენა — ნათება იზრდება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                2.0)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "switch_on_cover",
                                "დაფარვა — შუქდიოდი ჩაკრება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0003)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.0)
                        )
                )
        );
    }

    /**
     * PR.L1.2 — switch + series R + photoresistor ∥ red LED (inverse of L1.1).
     * Torch lowers PR R → most current shunts through PR; LED dims strongly but may
     * stay faintly visible (~0.5 mA) at full light — correct parallel physics.
     */
    private static ProblemValidationSpec prL12() {
        return new ProblemValidationSpec(
                "PR.L1.2",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_ambient",
                                "ჩამრთველი ჩართული — ნათელი",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.352)
                        ),
                        new ValidationCase(
                                "switch_on_torch",
                                "ფანრით დატენა — ნათება მცირდება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.001),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                3.0)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * PR.L2.4 — SPDT selects PR series (1 kΩ boost, torch brightens) vs parallel
     * (torch shunts LED → dims / off at full light). Reference: 1 kΩ + 5.1 kΩ + blue LED.
     */
    private static ProblemValidationSpec prL24() {
        return new ProblemValidationSpec(
                "PR.L2.4",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "slide_left_ambient",
                                "გადამრთველი A–B — ჩართული, ნათელი",
                                Map.of("switch", "closed", "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.352)
                        ),
                        new ValidationCase(
                                "slide_left_torch",
                                "A–B — ფანრით დატენა, ნათება იზრდება",
                                Map.of("switch", "closed", "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.004),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                2.0)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "slide_right_ambient",
                                "გადამრთველი A–C — ჩართული, ნათელი",
                                Map.of("switch", "closed", "slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.352)
                        ),
                        new ValidationCase(
                                "slide_right_torch",
                                "A–C — ფანრით დატენა, შუქდიოდი ჩაკრება",
                                Map.of("switch", "closed", "slide_switch", "right"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.001)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "slide_left_torch_again",
                                "A–B — ხელახლა ფანრით, ნათება ისევ იზრდება",
                                Map.of("switch", "closed", "slide_switch", "left"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.004)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * PR.L2.3 — switch + series R, then LED ∥ (photoresistor + series R).
     * Extra R in PR branch limits shunt current — LED dims under torch but stays on.
     */
    private static ProblemValidationSpec prL23() {
        return new ProblemValidationSpec(
                "PR.L2.3",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_ambient",
                                "ჩამრთველი ჩართული — ნათელი",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.001)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.352)
                        ),
                        new ValidationCase(
                                "switch_on_torch",
                                "ფანრით დატენა — ნათება მცირდება, მაგრამ არ ჩაკრება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00015),
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.009),
                                        new ValidationCheck(
                                                "led_1",
                                                "forward_current_vs_prior_ratio",
                                                "gt",
                                                1.15)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * PR.L1.5 — two red LEDs; PR in series with one LED; button parallels the LED
     * returns so both track light together. Button open: only the PR-branch LED
     * follows torch/cover; the other stays roughly constant.
     */
    private static ProblemValidationSpec prL15() {
        final String ambientOpen = "switch_on_button_open_ambient";
        final String ambientPressed = "switch_on_button_pressed_ambient";
        return new ProblemValidationSpec(
                "PR.L1.5",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                ambientOpen,
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი — ორივე ანთია",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00008),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "gt", 0.00008),
                                        new ValidationCheck(
                                                "leds",
                                                "led_max_forward_current",
                                                "gt",
                                                0.00008),
                                        new ValidationCheck(
                                                "leds",
                                                "led_min_forward_current",
                                                "gt",
                                                0.00005)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.352)
                        ),
                        new ValidationCase(
                                "switch_on_button_open_torch",
                                "ღილაკი გაშვებული — ფანრით მხოლოდ ერთი ნათება იცვლება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.00008),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "gt", 0.00008),
                                        new ValidationCheck(
                                                "leds",
                                                "led_max_forward_current",
                                                "gt_ref:" + ambientOpen,
                                                1.4),
                                        // Still asymmetric: not fully equalized.
                                        new ValidationCheck(
                                                "leds", "current_ratio", "gt", 1.25)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "switch_on_button_open_cover",
                                "ღილაკი გაშვებული — დაფარვით მხოლოდ ერთი ჩაქრება",
                                Map.of("switch", "closed", "button_1", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "leds",
                                                "led_min_forward_current",
                                                "lt",
                                                0.0003),
                                        new ValidationCheck(
                                                "leds",
                                                "led_max_forward_current",
                                                "gt",
                                                0.001)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.0)
                        ),
                        new ValidationCase(
                                ambientPressed,
                                "ღილაკი დაჭერილი — ორივე ანთია, ნათება ახლოსაა",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "gt", 0.0002),
                                        new ValidationCheck(
                                                "leds", "current_ratio", "lt", 2.0),
                                        new ValidationCheck(
                                                "leds",
                                                "led_max_forward_current",
                                                "gt",
                                                0.0002),
                                        new ValidationCheck(
                                                "leds",
                                                "led_min_forward_current",
                                                "gt",
                                                0.0002)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.352)
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed_torch",
                                "ღილაკი დაჭერილი — ფანრით ორივე სინქრონულად იმატებს",
                                Map.of("switch", "closed", "button_1", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "leds",
                                                "led_min_forward_current",
                                                "gt_ref:" + ambientPressed,
                                                1.3),
                                        new ValidationCheck(
                                                "leds",
                                                "led_max_forward_current",
                                                "gt_ref:" + ambientPressed,
                                                1.3),
                                        new ValidationCheck(
                                                "leds", "current_ratio", "lt", 2.0)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        )
                )
        );
    }

    /**
     * PR.L2.9 — two LED branches with unequal series R; PR bridges the LED anodes.
     * Ambient: unequal brightness; torch: PR ≈ short → currents nearly equalize.
     */
    private static ProblemValidationSpec prL29() {
        return new ProblemValidationSpec(
                "PR.L2.9",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთული",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "led_max_forward_current", "lt", 0.0005)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_ambient",
                                "ჩამრთველი ჩართული — ერთი ძლიერი, მეორე სუსტი",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "led_min_forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "leds", "led_max_forward_current", "gt", 0.003),
                                        new ValidationCheck(
                                                "leds", "current_ratio", "gt", 3.5)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.352)
                        ),
                        new ValidationCase(
                                "switch_on_torch",
                                "ფანრით დატენა — ნათება გათანაბრდება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "led_min_forward_current", "gt", 0.002),
                                        new ValidationCheck(
                                                "leds", "current_ratio", "lt", 1.6)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "switch_on_cover",
                                "დაფარვა — ისევ განსხვავებული ნათება",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "leds", "led_min_forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "leds", "current_ratio", "gt", 3.5)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.0)
                        )
                )
        );
    }

    /**
     * PR.L3.10 — antiparallel red/green LEDs between PR–R divider tap and supply mid-rail.
     * Ambient / cover: only red; torch: only green; never both (dead-zone in between).
     */
    private static ProblemValidationSpec prL310() {
        return new ProblemValidationSpec(
                "PR.L3.10",
                List.of(
                        new ValidationCase(
                                "ambient_red_only",
                                "ოთახის განათება — მხოლოდ წითელი",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.00025),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0001)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.352)
                        ),
                        new ValidationCase(
                                "torch_green_only",
                                "ფანრით დანათება — მხოლოდ მწვანე",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.005),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.0001)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "cover_red_only",
                                "დაფარვა — მხოლოდ წითელი",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.00025),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0001)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.0)
                        )
                )
        );
    }

    /**
     * PR.L3.11 — series red/green LEDs with midpoint tied to PR–R divider tap.
     * Ambient: both on; torch: red only; cover: green dominates (red may stay
     * partially lit with low series R — same as common student 1 kΩ builds).
     */
    private static ProblemValidationSpec prL311() {
        return new ProblemValidationSpec(
                "PR.L3.11",
                List.of(
                        new ValidationCase(
                                "ambient_both_on",
                                "ოთახის განათება — ორივე ანთებულია",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.00016),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.0004)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.352)
                        ),
                        new ValidationCase(
                                "torch_red_only",
                                "ფანრით დანათება — მხოლოდ წითელი",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_red", "forward_current", "gt", 0.0005),
                                        new ValidationCheck(
                                                "led_green", "forward_current", "lt", 0.0001)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 1.0)
                        ),
                        new ValidationCase(
                                "cover_green_strong",
                                "დაფარვა — მწვანე ძლიერი, წითელი სუსტი",
                                Map.of(),
                                List.of(
                                        new ValidationCheck(
                                                "led_green", "forward_current", "gt", 0.0004),
                                        // With ~1 kΩ series R, cover ≈ ambient (red stays
                                        // partially lit). Require green-dominant, not red-off.
                                        new ValidationCheck(
                                                "leds", "current_ratio", "gt", 2.2),
                                        new ValidationCheck(
                                                "led_red", "forward_current", "lt", 0.004)
                                ),
                                null,
                                Map.of(),
                                Map.of("photo_resistor", 0.0)
                        )
                )
        );
    }

    /**
     * GEN.L2.1 — free-run blinker with NPN + PNP; ~1–2 s period preferred.
     * Switch off → dark; switch on → sustained oscillation (peak + dark + toggles).
     */
    private static ProblemValidationSpec genL21() {
        return new ProblemValidationSpec(
                "GEN.L2.1",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open"),
                                List.of(new ValidationCheck("lamp", "current", "lt", 0.001))),
                        new ValidationCase(
                                "free_run_blink",
                                "ჩამრთველი ჩართულია — ნათურა ციმციმებს",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp", "tran_current_abs_peak", "gt", 0.02),
                                        new ValidationCheck(
                                                "lamp", "tran_current_abs_min", "lt", 0.01),
                                        new ValidationCheck(
                                                "lamp", "tran_toggle_count", "gt", 1.5)),
                                "idle")));
    }

    /**
     * GEN.L2.2 — free-run blinker with two NPNs; ~10 s period preferred.
     */
    private static ProblemValidationSpec genL22() {
        return new ProblemValidationSpec(
                "GEN.L2.2",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ნათურა ჩამქრალია",
                                Map.of("switch", "open"),
                                List.of(new ValidationCheck("lamp", "current", "lt", 0.001))),
                        new ValidationCase(
                                "free_run_blink",
                                "ჩამრთველი ჩართულია — ნათურა ნელა ციმციმებს",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "lamp", "tran_current_abs_peak", "gt", 0.02),
                                        new ValidationCheck(
                                                "lamp", "tran_current_abs_min", "lt", 0.01),
                                        new ValidationCheck(
                                                "lamp", "tran_toggle_count", "gt", 0.5)),
                                "idle")));
    }

    /**
     * GEN.L2.3 — two-NPN LED flasher (anti-parallel / mid-rail); ≥6 s period class.
     * No switch-off case: LEDs hang on the mid-rail, so opening the master SPST
     * does not fully darken them (that is a follow-up question in the brief).
     */
    private static ProblemValidationSpec genL23() {
        return new ProblemValidationSpec(
                "GEN.L2.3",
                List.of(
                        new ValidationCase(
                                "free_run_blink",
                                "შუქდიოდები მონაცვლეობით ციმციმებენ",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_peak",
                                                "gt",
                                                0.0005),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_min",
                                                "lt",
                                                0.0002),
                                        new ValidationCheck(
                                                "led_1", "tran_led_toggle_count", "gt", 0.5),
                                        new ValidationCheck(
                                                "led_2",
                                                "tran_forward_current_peak",
                                                "gt",
                                                0.0005)),
                                "idle")));
    }

    /**
     * GEN.L2.4 — symmetric two-NPN LED multivibrator; ~10 s period.
     */
    private static ProblemValidationSpec genL24() {
        return new ProblemValidationSpec(
                "GEN.L2.4",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — შუქდიოდები ჩამქრალია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1", "forward_current", "lt", 0.0005),
                                        new ValidationCheck(
                                                "led_2", "forward_current", "lt", 0.0005))),
                        new ValidationCase(
                                "free_run_blink",
                                "ჩამრთველი ჩართულია — შუქდიოდები სიმეტრიულად ციმციმებენ",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_peak",
                                                "gt",
                                                0.0005),
                                        new ValidationCheck(
                                                "led_1",
                                                "tran_forward_current_min",
                                                "lt",
                                                0.0002),
                                        new ValidationCheck(
                                                "led_1", "tran_led_toggle_count", "gt", 0.5),
                                        new ValidationCheck(
                                                "led_2",
                                                "tran_forward_current_peak",
                                                "gt",
                                                0.0005),
                                        new ValidationCheck(
                                                "led_2",
                                                "tran_forward_current_min",
                                                "lt",
                                                0.0002)),
                                "idle")));
    }

    /**
     * GEN.L2.5 — two-NPN motor reverse oscillator; ~1 s direction flips.
     */
    private static ProblemValidationSpec genL25() {
        return new ProblemValidationSpec(
                "GEN.L2.5",
                List.of(
                        new ValidationCase(
                                "switch_off",
                                "ჩამრთველი გამორთულია — ძრავი გაჩერებულია",
                                Map.of("switch", "open"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1", "current", "lt", 0.001))),
                        new ValidationCase(
                                "free_run_reverse",
                                "ჩამრთველი ჩართულია — ძრავი მიმართულებას ცვლის",
                                Map.of("switch", "closed"),
                                List.of(
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_current_abs_peak",
                                                "gt",
                                                0.01),
                                        new ValidationCheck(
                                                "motor_1",
                                                "tran_sign_flip_count",
                                                "gt",
                                                0.5)),
                                "idle")));
    }

}
