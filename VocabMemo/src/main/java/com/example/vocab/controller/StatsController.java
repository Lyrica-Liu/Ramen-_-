package com.example.vocab.controller;

import com.example.vocab.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin
public class StatsController {

    private final ProgressService progressService;

    public StatsController(ProgressService progressService) {
        this.progressService = progressService;
    }

    public static class GlobalStatsResponse {
        private final int currentStreak;
        private final int longestStreak;
        private final List<ProgressService.DailyProgressSummary> daily;

        public GlobalStatsResponse(int currentStreak, int longestStreak, List<ProgressService.DailyProgressSummary> daily) {
            this.currentStreak = currentStreak;
            this.longestStreak = longestStreak;
            this.daily = daily;
        }

        public int getCurrentStreak()  { return currentStreak; }
        public int getLongestStreak()  { return longestStreak; }
        public List<ProgressService.DailyProgressSummary> getDaily() { return daily; }
    }

    @GetMapping
    public ResponseEntity<GlobalStatsResponse> getGlobalStats(
            @RequestParam(defaultValue = "365") int days) {
        return ResponseEntity.ok(new GlobalStatsResponse(
                progressService.getCurrentStreak(),
                progressService.getLongestStreak(),
                progressService.getGlobalDailyProgress(days)
        ));
    }
}
