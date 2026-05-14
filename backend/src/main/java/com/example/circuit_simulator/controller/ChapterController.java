package com.example.circuit_simulator.controller;

import com.example.circuit_simulator.dto.ChapterDTO;
import com.example.circuit_simulator.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chapters")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    @GetMapping
    public List<ChapterDTO> getAllChapters() {
        return chapterService.getAllChapters();
    }

    @GetMapping("/{code}")
    public ChapterDTO getChapter(@PathVariable String code) {
        return chapterService.getChapterByCode(code);
    }
}