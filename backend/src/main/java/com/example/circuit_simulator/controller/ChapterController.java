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
    public List<ChapterDTO> getAllChapters() {
        return chapterService.getAllChapters();
    }

    @GetMapping("/{code}/detail")
    public ChapterDetailDTO getChapterDetail(@PathVariable String code) {
        return chapterService.getChapterDetail(code);
    }

    @GetMapping("/{code}/problems")
    public List<ProblemListItemDTO> getChapterProblems(@PathVariable String code) {
        return problemService.getProblemListByChapterCode(code);
    }

    @GetMapping("/{code}/problems/{slug}")
    public ProblemDTO getChapterProblem(
            @PathVariable String code,
            @PathVariable String slug) {
        return problemService.getProblemDtoByChapterAndSlug(code, slug);
    }

    @GetMapping("/{code}")
    public ChapterDTO getChapter(@PathVariable String code) {
        return chapterService.getChapterByCode(code);
    }
}