package com.example.vocab.controller;

import com.example.vocab.model.Word;
import com.example.vocab.security.UserPrincipal;
import com.example.vocab.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/books/{bookId}/words")
@CrossOrigin
public class VocabularyController {
    private final VocabularyService vocabularyService;
    private final ProgressService progressService;
    private final BookService bookService;
    private final WordSearchService wordSearchService;
    private final DistractorGenerationService distractorService;
    private final MCQuestionService mcQuestionService;

    public VocabularyController(VocabularyService vocabularyService,
                                 ProgressService progressService,
                                 BookService bookService,
                                 WordSearchService wordSearchService,
                                 DistractorGenerationService distractorService,
                                 MCQuestionService mcQuestionService) {
        this.vocabularyService = vocabularyService;
        this.progressService = progressService;
        this.bookService = bookService;
        this.wordSearchService = wordSearchService;
        this.distractorService = distractorService;
        this.mcQuestionService = mcQuestionService;
    }

    public static class WordUpdateRequest {
        private String term;
        private String translation;

        public String getTerm() { return term; }
        public void setTerm(String term) { this.term = term; }
        public String getTranslation() { return translation; }
        public void setTranslation(String translation) { this.translation = translation; }
    }

    public static class ReviewRequest {
        private String result;

        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }
    }

    public static class SearchRequest {
        private String searchTerm;

        public String getSearchTerm() { return searchTerm; }
        public void setSearchTerm(String searchTerm) { this.searchTerm = searchTerm; }
    }

    public static class ProgressActivityRequest {
        private String type;
        private Integer amount;
        private Long wordId;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        public Long getWordId() { return wordId; }
        public void setWordId(Long wordId) { this.wordId = wordId; }
    }

    @ModelAttribute
    public void checkOwnership(@PathVariable("bookId") Long bookId, Authentication auth) {
        if (auth == null) return;
        Long userId = ((UserPrincipal) auth.getPrincipal()).getId();
        if (bookService.getBook(bookId, userId) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found");
        }
    }

    @GetMapping
    public List<Word> getWords(@PathVariable("bookId") Long bookId) {
        return vocabularyService.listWords(bookId);
    }

    @GetMapping("/review/daily")
    public List<Word> getDailyReviewWords(@PathVariable("bookId") Long bookId) {
        return vocabularyService.getDueWords(bookId);
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
        if (!"easy".equals(result) && !"hard".equals(result) && !"okay".equals(result)) {
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

    @GetMapping("/search")
    public ResponseEntity<WordSearchResponse> searchWord(@RequestParam String term) {
        if (term == null || term.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        WordSearchService.WordSearchResult result = wordSearchService.searchWord(term);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }

        List<String> distractors = distractorService.generateDistractors(
                result.getDefinition(), result.getDefinition(), 3);

        return ResponseEntity.ok(new WordSearchResponse(
                result.getTerm(),
                result.getDefinition(),
                result.getExample(),
                distractors,
                result.getApiSource()
        ));
    }

    @PostMapping("/from-search")
    public ResponseEntity<Word> addSearchedWord(
            @PathVariable("bookId") Long bookId,
            @RequestBody SearchRequest request
    ) {
        if (request == null || request.getSearchTerm() == null || request.getSearchTerm().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Word word = vocabularyService.addSearchedWord(bookId, request.getSearchTerm());
        if (word == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(word);
    }

    public static class WordSearchResponse {
        private String term;
        private String definition;
        private String example;
        private List<String> distractors;
        private String apiSource;

        public WordSearchResponse(String term, String definition, String example, List<String> distractors, String apiSource) {
            this.term = term;
            this.definition = definition;
            this.example = example;
            this.distractors = distractors;
            this.apiSource = apiSource;
        }

        public String getTerm() { return term; }
        public String getDefinition() { return definition; }
        public String getExample() { return example; }
        public List<String> getDistractors() { return distractors; }
        public String getApiSource() { return apiSource; }
    }
}
