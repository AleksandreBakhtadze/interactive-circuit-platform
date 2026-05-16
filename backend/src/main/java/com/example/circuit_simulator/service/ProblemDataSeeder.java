package com.example.circuit_simulator.service;

import com.example.circuit_simulator.model.Chapter;
import com.example.circuit_simulator.model.Problem;
import com.example.circuit_simulator.repository.ChapterRepository;
import com.example.circuit_simulator.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(2)
@RequiredArgsConstructor
public class ProblemDataSeeder implements CommandLineRunner {

    private final ChapterRepository chapterRepository;
    private final ProblemRepository problemRepository;

    private record ProblemSeed(String code, String title, int displayOrder) {}

    private static final List<ProblemSeed> ST_PROBLEMS = List.of(
            new ProblemSeed("ST.L1.1", "ნათურის ანთება ღილაკით", 1),
            new ProblemSeed("ST.L1.2", "ნათურის ანთება ღილაკით და ორი კვების წყაროთი", 2),
            new ProblemSeed("ST.L1.3", "ნათურის ანთება ღილაკით და ჩამრთველით", 3),
            new ProblemSeed("ST.L2.4", "ნათურის ანთება ორი ღილაკით", 4),
            new ProblemSeed("ST.L1.5", "ნათურის ნათების შემცირება", 5),
            new ProblemSeed("ST.L1.6", "კვების წყაროს მოკლე ჩართვის შემთხვევები", 6),
            new ProblemSeed("ST.L1.7", "შუქდიოდის გამოყენების მაგალითები", 7),
            new ProblemSeed("ST.L1.8", "წითელი შუქდიოდის ანთება ღილაკით", 8),
            new ProblemSeed("ST.L2.9", "წითელი და მწვანე შუქდიოდების ანთება ღილაკით", 9),
            new ProblemSeed("ST.L2.10", "შუქდიოდის ანთება მხოლოდ ორი ღილაკით", 10),
            new ProblemSeed("ST.L2.11", "შუქდიოდის ანთება ერთ-ერთი ღილაკით", 11),
            new ProblemSeed("ST.L2.12", "მწვანე და ლურჯი შუქდიოდის ანთება ერთ-ერთი ღილაკით", 12),
            new ProblemSeed("ST.L2.13", "წითელი და ლურჯი შუქდიოდის ანთება ორი ღილაკით", 13),
            new ProblemSeed("ST.L2.14", "მწვანეების და ლურჯების ანთება ორი ღილაკით", 14)
    );

    @Override
    public void run(String... args) {
        chapterRepository.findByCode("ST").ifPresent(this::seedChapterProblems);
    }

    private void seedChapterProblems(Chapter chapter) {
        for (ProblemSeed seed : ST_PROBLEMS) {
            problemRepository.findByCode(seed.code()).ifPresentOrElse(
                    problem -> updateProblem(problem, chapter, seed),
                    () -> createProblem(chapter, seed)
            );
        }
        System.out.println("ST chapter problems seeded (" + ST_PROBLEMS.size() + ").");
    }

    private void createProblem(Chapter chapter, ProblemSeed seed) {
        Problem problem = new Problem();
        problem.setCode(seed.code());
        problem.setTitle(seed.title());
        problem.setDisplayOrder(seed.displayOrder());
        problem.setChapter(chapter);
        problem.setDifficulty("beginner");
        problemRepository.save(problem);
    }

    private void updateProblem(Problem problem, Chapter chapter, ProblemSeed seed) {
        problem.setTitle(seed.title());
        problem.setDisplayOrder(seed.displayOrder());
        problem.setChapter(chapter);
        problemRepository.save(problem);
    }
}
