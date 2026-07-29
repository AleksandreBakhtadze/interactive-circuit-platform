package com.example.circuit_simulator.catalog;

import com.example.circuit_simulator.validation.ProblemValidationSpec;
import com.example.circuit_simulator.validation.ValidationCase;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProblemCatalogLoaderTest {

    private static ProblemCatalog catalog;

    @BeforeAll
    static void load() {
        catalog = ProblemCatalogLoader.loadCatalog(ProblemCatalogLoader.createYamlMapper());
    }

    @Test
    void loadsStChapterWithValidationCases() {
        assertTrue(catalog.chaptersByCode().containsKey("ST"));
        assertFalse(catalog.problemsByChapter().get("ST").isEmpty());

        ProblemValidationSpec spec = catalog.findSpec("ST.L1.1").orElse(null);
        assertNotNull(spec, "ST.L1.1 validation should load from YAML");
        assertEquals("ST.L1.1", spec.problemCode());
        assertTrue(spec.cases().size() >= 2);

        ValidationCase first = spec.cases().get(0);
        assertEquals("button_pressed", first.label());
        assertFalse(first.checks().isEmpty());
        assertEquals("lamp", first.checks().get(0).role());
    }

    @Test
    void loadsAllExpectedChapters() {
        for (String code : new String[] {
            "ST", "LR", "SW", "DM", "VR", "CP", "PR", "DI", "TR", "TCP", "DTR", "TFB", "TDM"
        }) {
            assertTrue(catalog.chaptersByCode().containsKey(code), "missing chapter " + code);
        }
        assertTrue(catalog.specsByCode().size() > 50, "expected many validation specs");
    }
}
