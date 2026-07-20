package com.example.circuit_simulator.service;

import com.example.circuit_simulator.dto.ChapterDTO;
import com.example.circuit_simulator.dto.ChapterDetailDTO;
import com.example.circuit_simulator.dto.ProblemListItemDTO;
import com.example.circuit_simulator.dto.UserBadgeDTO;
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

    private static final Set<String> HIDDEN_CHAPTER_CODES = Set.of("TRL");

    private final ChapterRepository chapterRepository;
    private final ProblemRepository problemRepository;
    private final ProblemCompletionService completionService;

    public List<ChapterDTO> getAllChapters() {
        return getAllChapters(null);
    }

    public List<ChapterDTO> getAllChapters(Long userId) {
        return chapterRepository.findAll()
                .stream()
                .filter(ch -> !isHiddenChapter(ch.getCode()))
                .sorted((a, b) -> a.getDisplayOrder() - b.getDisplayOrder())
                .map(ch -> toChapterDto(ch, userId))
                .toList();
    }

    /** Total problems across visible modules (sum of per-chapter counts). */
    public long countPublishedProblems() {
        return chapterRepository.findAll()
                .stream()
                .filter(ch -> !isHiddenChapter(ch.getCode()))
                .mapToLong(ch -> problemRepository.countByChapterId(ch.getId()))
                .sum();
    }

    /** Module badges earned when every problem in a chapter is solved. */
    public List<UserBadgeDTO> getEarnedBadges(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return chapterRepository.findAll()
                .stream()
                .filter(ch -> !isHiddenChapter(ch.getCode()))
                .filter(ch -> isChapterComplete(userId, ch))
                .sorted((a, b) -> a.getDisplayOrder() - b.getDisplayOrder())
                .map(ch -> new UserBadgeDTO(ch.getCode(), ch.getTitleKa(), ch.getTitleEn()))
                .toList();
    }

    private boolean isChapterComplete(Long userId, Chapter chapter) {
        long total = problemRepository.countByChapterId(chapter.getId());
        if (total == 0) {
            return false;
        }
        long solved = completionService.countSolvedInChapter(userId, chapter.getId());
        return solved >= total;
    }

    private static boolean isHiddenChapter(String code) {
        return HIDDEN_CHAPTER_CODES.contains(code.toUpperCase());
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
