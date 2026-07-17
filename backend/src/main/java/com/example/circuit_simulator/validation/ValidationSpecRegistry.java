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
                                        // Must be lit, but noticeably dimmer than ~0.25A baseline at 6V.
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
                                                "tran_forward_current_early",
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
