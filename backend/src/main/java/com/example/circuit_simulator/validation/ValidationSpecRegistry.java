package com.example.circuit_simulator.validation;

import com.example.circuit_simulator.catalog.ProblemCatalogLoader;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

/**
 * Declarative validation rules per problem, loaded from
 * {@code classpath:problems/*.yaml}.
 */
@Component
public class ValidationSpecRegistry {

    private final Map<String, ProblemValidationSpec> specs;

    public ValidationSpecRegistry(ProblemCatalogLoader catalogLoader) {
        this.specs = catalogLoader.getCatalog().specsByCode();
    }

    public Optional<ProblemValidationSpec> findByProblemCode(String problemCode) {
        return Optional.ofNullable(specs.get(problemCode));
    }

    /** Test / diagnostics helper. */
    public Map<String, ProblemValidationSpec> allSpecs() {
        return specs;
    }
}
