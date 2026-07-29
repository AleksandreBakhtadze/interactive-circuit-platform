package com.example.circuit_simulator.service;

import com.example.circuit_simulator.catalog.ChapterCatalogFile;
import com.example.circuit_simulator.catalog.ProblemCatalog;
import com.example.circuit_simulator.catalog.ProblemCatalogLoader;
import com.example.circuit_simulator.model.Chapter;
import com.example.circuit_simulator.model.Problem;
import com.example.circuit_simulator.repository.ChapterRepository;
import com.example.circuit_simulator.repository.CircuitRepository;
import com.example.circuit_simulator.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds {@code problems} rows from {@code classpath:problems/*.yaml}.
 * Problems with {@code displayOrder >= 10000} are catalog/validation-only
 * (legacy orphan specs) and are not inserted into the DB.
 */
@Component
@Order(2)
@RequiredArgsConstructor
public class ProblemDataSeeder implements CommandLineRunner {

    /** Orphan validation-only entries from the catalog export use this floor. */
    static final int VALIDATION_ONLY_ORDER_FLOOR = 10_000;

    private final ChapterRepository chapterRepository;
    private final ProblemRepository problemRepository;
    private final CircuitRepository circuitRepository;
    private final ProblemCatalogLoader catalogLoader;

    @Override
    @Transactional
    public void run(String... args) {
        removeRetiredChapters();
        removeRetiredProblems();

        ProblemCatalog catalog = catalogLoader.getCatalog();
        for (String chapterCode : catalog.chapterCodes()) {
            List<ChapterCatalogFile.CatalogProblem> problems =
                    catalog.problemsByChapter().getOrDefault(chapterCode, List.of());
            seedChapter(chapterCode, problems);
        }
    }

    private void removeRetiredChapters() {
        for (String code : List.of("TRL", "GEN")) {
            chapterRepository.findByCode(code).ifPresent(chapter -> {
                for (Problem problem : problemRepository.findAllByChapterCode(code)) {
                    circuitRepository.findByProblemId(problem.getId())
                            .forEach(circuitRepository::delete);
                    problemRepository.delete(problem);
                }
                chapterRepository.delete(chapter);
                System.out.println("Removed retired " + code + " chapter.");
            });
        }
    }

    private void removeRetiredProblems() {
        for (String code : List.of("SW.L3.12", "DTR.L3.10")) {
            problemRepository.findByCode(code).ifPresent(problem -> {
                circuitRepository.findByProblemId(problem.getId())
                        .forEach(circuitRepository::delete);
                problemRepository.delete(problem);
                System.out.println("Removed retired problem " + code + ".");
            });
        }
    }

    private void seedChapter(String chapterCode, List<ChapterCatalogFile.CatalogProblem> problems) {
        chapterRepository.findByCode(chapterCode).ifPresentOrElse(
                chapter -> {
                    int seeded = 0;
                    for (ChapterCatalogFile.CatalogProblem entry : problems) {
                        if (entry.getDisplayOrder() >= VALIDATION_ONLY_ORDER_FLOOR) {
                            continue;
                        }
                        problemRepository.findByCode(entry.getCode()).ifPresentOrElse(
                                problem -> updateProblem(problem, chapter, entry),
                                () -> createProblem(chapter, entry)
                        );
                        seeded++;
                    }
                    System.out.println(chapterCode + " chapter problems seeded (" + seeded + ").");
                },
                () -> System.err.println(
                        "ProblemDataSeeder: chapter " + chapterCode + " not found — skipping problem seed")
        );
    }

    private void createProblem(Chapter chapter, ChapterCatalogFile.CatalogProblem entry) {
        Problem problem = new Problem();
        problem.setCode(entry.getCode());
        applyFields(problem, chapter, entry);
        problemRepository.save(problem);
    }

    private void updateProblem(Problem problem, Chapter chapter, ChapterCatalogFile.CatalogProblem entry) {
        applyFields(problem, chapter, entry);
        problemRepository.save(problem);
    }

    private void applyFields(Problem problem, Chapter chapter, ChapterCatalogFile.CatalogProblem entry) {
        problem.setTitle(entry.getTitle());
        problem.setDisplayOrder(entry.getDisplayOrder());
        problem.setChapter(chapter);
        problem.setDifficulty(
                entry.getDifficulty() != null && !entry.getDifficulty().isBlank()
                        ? entry.getDifficulty()
                        : "beginner");
        if (entry.getDescription() != null) {
            problem.setDescription(entry.getDescription());
        }
        if (entry.getHint() != null) {
            problem.setHint(entry.getHint());
        }
        if (entry.getQuestions() != null) {
            problem.setQuestions(entry.getQuestions());
        }
        if (entry.getMethodology() != null) {
            problem.setMethodology(entry.getMethodology());
        }
    }
}
