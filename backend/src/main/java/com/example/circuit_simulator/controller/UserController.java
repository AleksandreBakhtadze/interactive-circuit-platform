package com.example.circuit_simulator.controller;

import com.example.circuit_simulator.dto.RegisterRequest;
import com.example.circuit_simulator.dto.RegisterResponse;
import com.example.circuit_simulator.dto.UserStatsResponse;
import com.example.circuit_simulator.service.ChapterService;
import com.example.circuit_simulator.service.ProblemCompletionService;
import com.example.circuit_simulator.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.circuit_simulator.dto.LoginRequest;
import com.example.circuit_simulator.dto.LoginResponse;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ProblemCompletionService completionService;
    private final ChapterService chapterService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            RegisterResponse response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<?> getStats(@PathVariable Long userId) {
        try {
            userService.getUserById(userId);
            long solvedCount = completionService.countSolved(userId);
            long totalCount = chapterService.countPublishedProblems();
            var badges = chapterService.getEarnedBadges(userId);
            var activity = completionService.getActivitySinceMonths(userId, 5);
            return ResponseEntity.ok(new UserStatsResponse(
                    solvedCount, totalCount, badges, activity));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}