package com.example.circuit_simulator.service;

import com.example.circuit_simulator.dto.ChapterDTO;
import com.example.circuit_simulator.dto.ChapterDetailDTO;
import com.example.circuit_simulator.dto.ProblemListItemDTO;
import com.example.circuit_simulator.model.Chapter;
import com.example.circuit_simulator.model.Problem;
import com.example.circuit_simulator.repository.ChapterRepository;
import com.example.circuit_simulator.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ChapterService {

    private static final Set<String> HIDDEN_CHAPTER_CODES = Set.of("PR", "TRL");

    private final ChapterRepository chapterRepository;
    private final ProblemRepository problemRepository;
    private final ProblemCompletionService completionService;

    public List<ChapterDTO> getAllChapters() {
        return getAllChapters(null);
    }

    public List<ChapterDTO> getAllChapters(Long userId) {
        return chapterRepository.findAll()
                .stream()
                .filter(ch -> !HIDDEN_CHAPTER_CODES.contains(ch.getCode().toUpperCase()))
                .sorted((a, b) -> a.getDisplayOrder() - b.getDisplayOrder())
                .map(ch -> toChapterDto(ch, userId))
                .toList();
    }

    public ChapterDTO getChapterByCode(String code) {
        return getChapterByCode(code, null);
    }

    public ChapterDTO getChapterByCode(String code, Long userId) {
        Chapter ch = chapterRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Chapter not found: " + code));
        return toChapterDto(ch, userId);
    }

    public ChapterDetailDTO getChapterDetail(String code) {
        return getChapterDetail(code, null);
    }

    public ChapterDetailDTO getChapterDetail(String code, Long userId) {
        String chapterCode = code.toUpperCase();
        ChapterDTO chapter = getChapterByCode(chapterCode, userId);
        List<Problem> problems = problemRepository.findAllByChapterCode(chapterCode);
        Set<Long> solvedIds = userId == null
                ? Collections.emptySet()
                : completionService.findSolvedProblemIds(
                        userId,
                        problems.stream().map(Problem::getId).toList());

        List<ProblemListItemDTO> items = problems.stream()
                .map(p -> new ProblemListItemDTO(
                        p.getId(),
                        p.getCode(),
                        p.getTitle(),
                        p.getDisplayOrder() != null ? p.getDisplayOrder() : 0,
                        solvedIds.contains(p.getId())
                ))
                .toList();
        return new ChapterDetailDTO(chapter, items);
    }

    private ChapterDTO toChapterDto(Chapter ch, Long userId) {
        long problemCount = problemRepository.countByChapterId(ch.getId());
        long solvedCount = completionService.countSolvedInChapter(userId, ch.getId());
        return new ChapterDTO(
                ch.getId(),
                ch.getCode(),
                ch.getTitleKa(),
                ch.getTitleEn(),
                ch.getDisplayOrder(),
                problemCount,
                solvedCount
        );
    }
}
