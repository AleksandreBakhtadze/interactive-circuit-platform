package com.example.circuit_simulator.service;

import com.example.circuit_simulator.model.Chapter;
import com.example.circuit_simulator.model.Problem;
import com.example.circuit_simulator.repository.ChapterRepository;
import com.example.circuit_simulator.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(2)
@RequiredArgsConstructor
public class ProblemDataSeeder implements CommandLineRunner {

    private final ChapterRepository chapterRepository;
    private final ProblemRepository problemRepository;

    private record ProblemSeed(String code, String title, int displayOrder) {}

    private record ProblemContent(
            String description,
            String hint,
            String questions,
            String methodology
    ) {}

    private static final java.util.Map<String, ProblemContent> ST_PROBLEM_CONTENT = java.util.Map.of(
            "ST.L1.2",
            new ProblemContent(
                    "გამოიყენეთ მხოლოდ შემდეგი დეტალები: ღილაკი, ნათურა, ორი კვების წყარო და გამტარები. ააწყვეთ წრედი, რომელიც იმუშავებს ასე: თუ ღილაკს დავაწვებით, ნათურა უნდა აინთოს; თუ ღილაკს ავუშვებთ, ნათურა უნდა ჩაქრეს. ეს არის წინა სავარჯიშოს მსგავსი ამოცანა იმ განსხავავებით, რომ ერთი კვების წყაროს ნაცვლად უნდა გამოიყენოთ ორი. წრედის აწყობის შემდეგ, აღწერეთ რა შეიცვალა წინა ამოცანასთან შედარებით და რამ გამოიწვია ეს ცვლილება?",
                    "ერთი კვების წყაროს დადებითი პოლუსი მიაერთეთ მეორე კვების წყაროს უარყოფით პოლუსს. ნათურის ასანთებად გამოიყენეთ დარჩენილი თავისუფალი პოლუსები.",
                    "როგორ იმუშავებს წრედი თუ ნათურას ჩავრთავთ კვების წყაროებს შორის?\n"
                            + "როგორ იმუშავებს წრედი თუ კვებების მერთების თანამიმდევრობას შევცვლით — ერთი კვების დადებით პოლუსს მივაერთებთ მეორე კვების დადებითს? ახსენით რატომ?",
                    "ამ სავარჯიშოში პირველად უნდა გამოიყენონ მიმდევრობით ჩართული ორი კვების წყარო. ნათურის ნათების მომატებით პრაქტიკულად უნდა ნახონ, რომ ორი კვების წყაროს ძაბვა იკრიბება და ჯამური ძაბვა იზრდება."
            )
    );

    private static final java.util.Map<String, ProblemContent> ST_L13_CONTENT =
            java.util.Map.of(
                    "ST.L1.3",
                    new ProblemContent(
                            "გამოიყენეთ მხოლოდ შემდეგი დეტალები: ღილაკი, ნათურა, ჩამრთველი, ერთი კვების წყარო და გამტარები. ააწყვეთ წრედი, რომელიც იმუშავებს ასე: წრედის აწყობის შემდეგ, თუ მხოლოდ ჩამრთველით ჩართავთ წრედს (ღილაკის გარეშე), ნათურა არ უნდა აინთოს; თუ ღილაკს დავაწვებით, ნათურა უნდა აინთოს; თუ ღილაკს ავუშვებთ, ნათურა უნდა ჩაქრეს. ამოცანაში დამატებით უნდა გამოიყენოთ ჩამრთველი — აწყობის პროცესში ის გამორთული უნდა იყოს; დარწმუნდების შემდეგ, რომ წრედი სწორად არის აწყობილი, შეგიძლიათ ჩართოთ.",
                            "წრედში დენმა უნდა გაიაროს ჩამრთველის გავლით. ჩამრთველი ჩართეთ ღილაკამდე (საშუალო თავაური — კვების დადებითი პოლუსის მხრიდან).",
                            "შეიცვლება თუ არა წრედის სამუშაო პრინციპი თუ ღილაკს და ჩამრთველს გავუცვლით ადგილები?\n"
                                    + "შეიცვლება თუ არა წრედის სამუშაო პრინციპი თუ ბუნებრივად შემოვატრიალებთ?",
                            "ამ სავარჯიოiათი უნდა გაეცნონ ჩამრთველის პრაქტიკულ გამოყენებას. წრედის აწყობის დროს ჩამრთველი გამორთული უნდა იყოს; სასურველია მიერთოთ კვების დადებით პოლუსთან და ჩართოთ მხოლოდ აწყობის დასრულებისა და შემოწმების შემდეგ."
                    )
            );

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
    @Transactional
    public void run(String... args) {
        chapterRepository.findByCode("ST").ifPresentOrElse(
                this::seedChapterProblems,
                () -> System.err.println("ProblemDataSeeder: chapter ST not found — skipping problem seed")
        );
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
        applyRichContent(problem, seed.code());
        problemRepository.save(problem);
    }

    private void updateProblem(Problem problem, Chapter chapter, ProblemSeed seed) {
        problem.setTitle(seed.title());
        problem.setDisplayOrder(seed.displayOrder());
        problem.setChapter(chapter);
        applyRichContent(problem, seed.code());
        problemRepository.save(problem);
    }

    private void applyRichContent(Problem problem, String code) {
        ProblemContent content = ST_PROBLEM_CONTENT.get(code);
        if (content == null) {
            content = ST_L13_CONTENT.get(code);
        }
        if (content == null) {
            return;
        }
        problem.setDescription(content.description());
        problem.setHint(content.hint());
        problem.setQuestions(content.questions());
        problem.setMethodology(content.methodology());
    }
}
