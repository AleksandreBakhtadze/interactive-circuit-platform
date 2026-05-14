package com.example.circuit_simulator.service;

import com.example.circuit_simulator.dto.ChapterDTO;
import com.example.circuit_simulator.model.Chapter;
import com.example.circuit_simulator.repository.ChapterRepository;
import com.example.circuit_simulator.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final ProblemRepository problemRepository;

    public List<ChapterDTO> getAllChapters() {
        return chapterRepository.findAll()
                .stream()
                .sorted((a, b) -> a.getDisplayOrder() - b.getDisplayOrder())
                .map(ch -> new ChapterDTO(
                        ch.getId(),
                        ch.getCode(),
                        ch.getTitleKa(),
                        ch.getTitleEn(),
                        ch.getDisplayOrder(),
                        problemRepository.countByChapterId(ch.getId())
                ))
                .toList();
    }

    public ChapterDTO getChapterByCode(String code) {
        Chapter ch = chapterRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Chapter not found: " + code));
        return new ChapterDTO(
                ch.getId(),
                ch.getCode(),
                ch.getTitleKa(),
                ch.getTitleEn(),
                ch.getDisplayOrder(),
                problemRepository.countByChapterId(ch.getId())
        );
    }
}