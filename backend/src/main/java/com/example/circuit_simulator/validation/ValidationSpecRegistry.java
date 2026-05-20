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

    private static final Map<String, ProblemValidationSpec> SPECS = Map.of(
            "ST.L1.1", stL11(),
            "ST.L1.2", stL12(),
            "ST.L1.3", stL13()
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
                                Map.of("button", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.01)
                                )
                        ),
                        new ValidationCase(
                                "button_released",
                                "ღილაკი არ არის დაჭერილი",
                                Map.of("button", "open"),
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
                                Map.of("button", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.01)
                                )
                        ),
                        new ValidationCase(
                                "button_released",
                                "ღილაკი არ არის დაჭერილი",
                                Map.of("button", "open"),
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
                                Map.of("switch", "open", "button", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_off_button_pressed",
                                "ჩამრთველი გამორთული, ღილაკი დაჭერილი",
                                Map.of("switch", "open", "button", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_open",
                                "ჩამრთველი ჩართული, ღილაკი არ არის დაჭერილი",
                                Map.of("switch", "closed", "button", "open"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "lt", 0.001)
                                )
                        ),
                        new ValidationCase(
                                "switch_on_button_pressed",
                                "ჩამრთველი ჩართული, ღილაკი დაჭერილი",
                                Map.of("switch", "closed", "button", "closed"),
                                List.of(
                                        new ValidationCheck("lamp", "current", "gt", 0.01)
                                )
                        )
                )
        );
    }
}
