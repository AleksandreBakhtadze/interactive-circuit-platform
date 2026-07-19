package com.example.circuit_simulator.controller;

import com.example.circuit_simulator.dto.ChapterDTO;
import com.example.circuit_simulator.dto.ChapterDetailDTO;
import com.example.circuit_simulator.dto.ProblemDTO;
import com.example.circuit_simulator.dto.ProblemListItemDTO;
import com.example.circuit_simulator.service.ChapterService;
import com.example.circuit_simulator.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;
    private final ProblemService problemService;

    @GetMapping
    public List<ChapterDTO> getAllChapters(
            @RequestParam(required = false) Long userId) {
        return chapterService.getAllChapters(userId);
    }

    @GetMapping("/{code}/detail")
    public ChapterDetailDTO getChapterDetail(
            @PathVariable String code,
            @RequestParam(required = false) Long userId) {
        return chapterService.getChapterDetail(code, userId);
    }

    @GetMapping("/{code}/problems")
    public List<ProblemListItemDTO> getChapterProblems(
            @PathVariable String code,
            @RequestParam(required = false) Long userId) {
        return problemService.getProblemListByChapterCode(code, userId);
    }

    @GetMapping("/{code}/problems/{slug}")
    public ProblemDTO getChapterProblem(
            @PathVariable String code,
            @PathVariable String slug) {
        return problemService.getProblemDtoByChapterAndSlug(code, slug);
    }

    @GetMapping("/{code}")
    public ChapterDTO getChapter(
            @PathVariable String code,
            @RequestParam(required = false) Long userId) {
        return chapterService.getChapterByCode(code, userId);
    }
}