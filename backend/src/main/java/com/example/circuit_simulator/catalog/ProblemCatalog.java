package com.example.circuit_simulator.catalog;

import com.example.circuit_simulator.validation.ProblemValidationSpec;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Immutable in-memory view of all {@code problems/*.yaml} chapter files.
 */
public final class ProblemCatalog {

    private final Map<String, ChapterCatalogFile> chaptersByCode;
    private final Map<String, ProblemValidationSpec> specsByCode;
    private final Map<String, List<ChapterCatalogFile.CatalogProblem>> problemsByChapter;

    public ProblemCatalog(List<ChapterCatalogFile> files) {
        Map<String, ChapterCatalogFile> chapters = new LinkedHashMap<>();
        Map<String, ProblemValidationSpec> specs = new LinkedHashMap<>();
        Map<String, List<ChapterCatalogFile.CatalogProblem>> byChapter = new LinkedHashMap<>();

        for (ChapterCatalogFile file : files) {
            if (file == null || file.getChapter() == null || file.getChapter().isBlank()) {
                continue;
            }
            String chapter = file.getChapter().trim().toUpperCase();
            chapters.put(chapter, file);
            List<ChapterCatalogFile.CatalogProblem> problems =
                    file.getProblems() != null ? List.copyOf(file.getProblems()) : List.of();
            byChapter.put(chapter, problems);
            for (ChapterCatalogFile.CatalogProblem problem : problems) {
                if (problem.getCode() == null || problem.getCode().isBlank()) {
                    continue;
                }
                ProblemValidationSpec spec = problem.toValidationSpec();
                if (spec != null) {
                    specs.put(problem.getCode(), spec);
                }
            }
        }

        this.chaptersByCode = Collections.unmodifiableMap(chapters);
        this.specsByCode = Collections.unmodifiableMap(specs);
        this.problemsByChapter = Collections.unmodifiableMap(byChapter);
    }

    public Map<String, ChapterCatalogFile> chaptersByCode() {
        return chaptersByCode;
    }

    public Map<String, ProblemValidationSpec> specsByCode() {
        return specsByCode;
    }

    public Map<String, List<ChapterCatalogFile.CatalogProblem>> problemsByChapter() {
        return problemsByChapter;
    }

    public Optional<ProblemValidationSpec> findSpec(String problemCode) {
        return Optional.ofNullable(specsByCode.get(problemCode));
    }

    public List<String> chapterCodes() {
        return List.copyOf(chaptersByCode.keySet());
    }
}
