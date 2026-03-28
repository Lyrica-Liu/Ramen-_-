package com.example.vocab.controller;

import com.example.vocab.model.Word;
import com.example.vocab.service.ProgressService;
import com.example.vocab.service.VocabularyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/books/{bookId}/words")
@CrossOrigin
public class VocabularyController {
    private final VocabularyService vocabularyService;
    private final ProgressService progressService;

    public static class WordUpdateRequest {
        private String term;
        private String translation;

        public String getTerm() {
            return term;
        }

        public void setTerm(String term) {
            this.term = term;
        }

        public String getTranslation() {
            return translation;
        }

        public void setTranslation(String translation) {
            this.translation = translation;
        }
    }

    public static class ReviewRequest {
        private String result;

        public String getResult() {
            return result;
        }

        public void setResult(String result) {
            this.result = result;
        }
    }

    public static class ProgressActivityRequest {
        private String type;
        private Integer amount;
        private Long wordId;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Integer getAmount() {
            return amount;
        }

        public void setAmount(Integer amount) {
            this.amount = amount;
        }

        public Long getWordId() {
            return wordId;
        }

        public void setWordId(Long wordId) {
            this.wordId = wordId;
        }
    }

    public VocabularyController(VocabularyService vocabularyService, ProgressService progressService) {
        this.vocabularyService = vocabularyService;
        this.progressService = progressService;
    }

    @GetMapping
    public List<Word> getWords(@PathVariable("bookId") Long bookId) {
        return vocabularyService.listWords(bookId);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<Word>> addWords(@PathVariable("bookId") Long bookId, @RequestBody List<Word> payload) {
        if (payload == null || payload.isEmpty()) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
        List<Word> added = vocabularyService.addWords(bookId, payload);
        return ResponseEntity.ok(added);
    }

    @PostMapping("/{wordId}/review")
    public ResponseEntity<Word> reviewWord(
            @PathVariable("bookId") Long bookId,
            @PathVariable("wordId") Long wordId,
            @RequestBody ReviewRequest request
    ) {
        if (request == null || request.getResult() == null) {
            return ResponseEntity.badRequest().build();
        }

        String result = request.getResult().trim().toLowerCase();
        if (!"easy".equals(result) && !"hard".equals(result)) {
            return ResponseEntity.badRequest().build();
        }

        Word updated = vocabularyService.updateReview(bookId, wordId, result);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{wordId}")
    public ResponseEntity<Word> updateWord(
            @PathVariable("bookId") Long bookId,
            @PathVariable("wordId") Long wordId,
            @RequestBody WordUpdateRequest request
    ) {
        if (request == null || request.getTerm() == null || request.getTranslation() == null) {
            return ResponseEntity.badRequest().build();
        }

        String term = request.getTerm().trim();
        String translation = request.getTranslation().trim();
        if (term.isEmpty() || translation.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Word updated = vocabularyService.updateWord(bookId, wordId, term, translation);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{wordId}")
    public ResponseEntity<Void> deleteWord(
            @PathVariable("bookId") Long bookId,
            @PathVariable("wordId") Long wordId
    ) {
        boolean deleted = vocabularyService.deleteWord(bookId, wordId);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats/daily")
    public ResponseEntity<List<VocabularyService.DailyStats>> getDailyStats(
            @PathVariable("bookId") Long bookId,
            @RequestParam(name = "days", defaultValue = "7") int days
    ) {
        return ResponseEntity.ok(vocabularyService.getDailyStats(bookId, days));
    }

    @GetMapping("/progress")
    public ResponseEntity<ProgressService.ProgressHeader> getProgressHeader(
            @PathVariable("bookId") Long bookId
    ) {
        return ResponseEntity.ok(progressService.getHeader(bookId));
    }

    @PostMapping("/progress/activity")
    public ResponseEntity<ProgressService.ProgressHeader> recordProgressActivity(
            @PathVariable("bookId") Long bookId,
            @RequestBody ProgressActivityRequest request
    ) {
        if (request == null || request.getType() == null) {
            return ResponseEntity.badRequest().build();
        }

        int amount = request.getAmount() == null ? 1 : request.getAmount();
        if (amount <= 0) {
            return ResponseEntity.badRequest().build();
        }

        String type = request.getType().trim().toLowerCase();
        if ("reviewed".equals(type)) {
            return ResponseEntity.ok(vocabularyService.recordReviewProgress(bookId, request.getWordId()));
        }
        if ("added".equals(type)) {
            return ResponseEntity.ok(progressService.recordAddedWords(bookId, amount));
        }

        return ResponseEntity.badRequest().build();
    }
}
