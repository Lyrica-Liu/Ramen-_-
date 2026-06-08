package com.example.vocab.service;

import com.example.vocab.model.*;
import com.example.vocab.repository.WordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class VocabularyService {
    private final WordRepository wordRepository;
    private final BookService bookService;
    private final ProgressService progressService;
    private final WordSearchService wordSearchService;
    private final DistractorGenerationService distractorService;
    private final MCQuestionService mcQuestionService;

    public VocabularyService(WordRepository wordRepository, BookService bookService, ProgressService progressService,
                             WordSearchService wordSearchService, DistractorGenerationService distractorService,
                             MCQuestionService mcQuestionService) {
        this.wordRepository = wordRepository;
        this.bookService = bookService;
        this.progressService = progressService;
        this.wordSearchService = wordSearchService;
        this.distractorService = distractorService;
        this.mcQuestionService = mcQuestionService;
    }

    public static class DailyStats {
        private String date;
        private int reviewedCount;
        private int addedCount;

        public DailyStats(String date, int reviewedCount, int addedCount) {
            this.date = date;
            this.reviewedCount = reviewedCount;
            this.addedCount = addedCount;
        }

        public String getDate() {
            return date;
        }

        public int getReviewedCount() {
            return reviewedCount;
        }

        public int getAddedCount() {
            return addedCount;
        }
    }

    public List<Word> listWords(Long bookId) {
        return wordRepository.findByBookIdOrderByPositionAsc(bookId);
    }

    public List<Word> addWords(Long bookId, List<Word> words) {
        VocabularyBook book = bookService.getBook(bookId);
        if (book == null) {
            return new ArrayList<>();
        }

        int position = (int) wordRepository.countByBookId(bookId);
        LocalDateTime now = LocalDateTime.now();
        for (Word word : words) {
            word.setBook(book);
            word.setPosition(position++);
            word.setReviewLevel(1);
            word.setNextReviewTime(now.plusDays(1));
            word.setLastReviewedTime(null);
            word.setCreatedTime(now);
            word.setLevelProgressDate(now.toLocalDate());
            word.setLevelProgressCount(0);
            word.setDifficultyScore(0);
        }
        List<Word> added = wordRepository.saveAll(words);
        progressService.recordAddedWords(bookId, added.size());
        return added;
    }

    public Word addSearchedWord(Long bookId, String searchTerm) {
        return addSearchedWord(bookId, searchTerm, null, null);
    }

    public Word addSearchedWord(Long bookId, String searchTerm, List<String> selectedDefinitions) {
        return addSearchedWord(bookId, searchTerm, selectedDefinitions, null);
    }

    public Word addSearchedWord(Long bookId, String searchTerm, List<String> selectedDefinitions, String exampleHint) {
        VocabularyBook book = bookService.getBook(bookId);
        if (book == null) return null;

        String canonicalTerm;
        String translation;
        String example = "";

        if (selectedDefinitions != null && !selectedDefinitions.isEmpty()) {
            if (exampleHint != null) {
                // Example already supplied by the frontend from the earlier search — skip external API call
                canonicalTerm = searchTerm;
                example = exampleHint;
            } else {
                WordSearchService.WordSearchResult searchResult = wordSearchService.searchWord(searchTerm);
                canonicalTerm = (searchResult != null) ? searchResult.getTerm() : searchTerm;
                example = (searchResult != null) ? searchResult.getExample() : "";
            }
            translation = String.join("\n", selectedDefinitions);
        } else {
            WordSearchService.WordSearchResult searchResult = wordSearchService.searchWord(searchTerm);
            if (searchResult == null) return null;
            canonicalTerm = searchResult.getTerm();
            translation = searchResult.getDefinition();
            example = searchResult.getExample();
        }

        WordApiMetadata apiMetadata = new WordApiMetadata();
        apiMetadata.setApiSource("freedictionary.dev");
        apiMetadata.setApiDefinition(translation);
        apiMetadata.setExampleSentence(example != null ? example : "");

        Word word = new Word();
        word.setTerm(canonicalTerm);
        word.setTranslation(translation);
        word.setBook(book);
        word.setPosition((int) wordRepository.countByBookId(bookId));
        word.setApiMetadata(apiMetadata);

        word.setReviewLevel(1);
        LocalDateTime now = LocalDateTime.now();
        word.setCreatedTime(now);
        word.setNextReviewTime(now.plusDays(1));
        word.setLevelProgressDate(now.toLocalDate());
        word.setLevelProgressCount(0);
        word.setDifficultyScore(0);

        apiMetadata.setWord(word);

        Word savedWord = wordRepository.save(word);
        progressService.recordAddedWords(bookId, 1);
        return savedWord;
    }

    public List<DailyStats> getDailyStats(Long bookId, int days) {
        List<DailyStats> stats = new ArrayList<>();
        for (ProgressService.DailyProgressSummary item : progressService.getDailyProgress(bookId, days)) {
            stats.add(new DailyStats(item.getDate(), item.getReviewedCount(), item.getAddedCount()));
        }
        return stats;
    }

    // SRS intervals in days: level 1→1d, 2→3d, 3→7d, 4→14d, 5→30d, 6→90d
    private static final int[] SRS_INTERVALS = {1, 3, 7, 14, 30, 90};

    public Word updateReview(Long bookId, Long wordId, String result) {
        Word word = wordRepository.findByIdAndBookId(wordId, bookId).orElse(null);
        if (word == null) return null;

        int level = word.getReviewLevel() == null ? 1 : Math.max(1, Math.min(6, word.getReviewLevel()));

        if ("correct".equalsIgnoreCase(result)) {
            level = Math.min(6, level + 1);
        }
        // incorrect: stay at current level

        LocalDateTime now = LocalDateTime.now();
        word.setReviewLevel(level);
        word.setLastReviewedTime(now);
        word.setNextReviewTime(now.plusDays(SRS_INTERVALS[level - 1]));

        Word savedWord = wordRepository.save(word);
        progressService.recordReviewActivity(bookId, 1);
        return savedWord;
    }

    public ProgressService.ProgressHeader recordReviewProgress(Long bookId, Long wordId) {
        if (wordId == null) {
            return progressService.getHeader(bookId);
        }

        return progressService.recordReviewActivity(bookId, 1);
    }

    public Word updateWord(Long bookId, Long wordId, String term, String translation) {
        Word word = wordRepository.findByIdAndBookId(wordId, bookId).orElse(null);
        if (word == null) {
            return null;
        }

        word.setTerm(term);
        word.setTranslation(translation);
        return wordRepository.save(word);
    }

    public boolean deleteWord(Long bookId, Long wordId) {
        Word word = wordRepository.findByIdAndBookId(wordId, bookId).orElse(null);
        if (word == null) {
            return false;
        }

        wordRepository.delete(word);

        List<Word> words = wordRepository.findByBookIdOrderByPositionAsc(bookId);
        for (int index = 0; index < words.size(); index++) {
            words.get(index).setPosition(index);
        }
        wordRepository.saveAll(words);
        return true;
    }

    public List<Word> getDueWords(Long bookId) {
        return wordRepository.findDueWordsPrioritizedByDifficulty(bookId, LocalDateTime.now());
    }

    public void clearWords(Long bookId) {
        wordRepository.deleteByBookId(bookId);
    }
}
