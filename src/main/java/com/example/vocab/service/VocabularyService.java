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
        List<Word> words = wordRepository.findByBookIdOrderByPositionAsc(bookId);
        LocalDateTime now = LocalDateTime.now();
        boolean changed = false;

        for (Word word : words) {
            if (word.getReviewLevel() == null || word.getReviewLevel() < 1) {
                word.setReviewLevel(1);
                changed = true;
            }
            if (word.getNextReviewTime() == null) {
                word.setNextReviewTime(now);
                changed = true;
            }
            if (word.getCreatedTime() == null) {
                word.setCreatedTime(now);
                changed = true;
            }
            if (word.getLevelProgressDate() == null) {
                word.setLevelProgressDate(now.toLocalDate());
                changed = true;
            }
            if (word.getLevelProgressCount() == null) {
                word.setLevelProgressCount(0);
                changed = true;
            }
            if (word.getDifficultyScore() == null) {
                word.setDifficultyScore(0);
                changed = true;
            }
        }

        if (changed) {
            Iterable<Word> wordsToSave = new ArrayList<>(words);
            wordRepository.saveAll(wordsToSave);
        }

        return words;
    }

    public List<Word> addWords(Long bookId, List<Word> words) {
        VocabularyBook book = bookService.getBook(bookId);
        if (book == null) {
            return new ArrayList<>();
        }

        List<Word> added = new ArrayList<>();
        int position = book.getWords().size();
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
            added.add(wordRepository.save(word));
        }
        progressService.recordAddedWords(bookId, added.size());
        return added;
    }

    public Word addSearchedWord(Long bookId, String searchTerm) {
        VocabularyBook book = bookService.getBook(bookId);
        if (book == null) {
            return null;
        }

        WordSearchService.WordSearchResult searchResult = wordSearchService.searchWord(searchTerm);
        if (searchResult == null) {
            return null;
        }

        List<String> distractors = distractorService.generateDistractors(
                searchResult.getDefinition(), searchResult.getDefinition(), 3);

        MCQuestion mcQuestion = mcQuestionService.createMCQuestion(
                searchResult.getDefinition(), distractors, "");

        WordApiMetadata apiMetadata = new WordApiMetadata();
        apiMetadata.setApiSource(searchResult.getApiSource());
        apiMetadata.setApiDefinition(searchResult.getDefinition());
        apiMetadata.setExampleSentence(searchResult.getExample());

        Word word = new Word();
        word.setTerm(searchResult.getTerm());
        word.setTranslation(searchResult.getDefinition());
        word.setBook(book);
        word.setPosition(book.getWords().size());
        word.setMcQuestion(mcQuestion);
        word.setApiMetadata(apiMetadata);

        word.setReviewLevel(1);
        LocalDateTime now = LocalDateTime.now();
        word.setCreatedTime(now);
        word.setLevelProgressDate(now.toLocalDate());
        word.setLevelProgressCount(0);
        word.setDifficultyScore(0);

        mcQuestion.setWord(word);
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

    public Word updateReview(Long bookId, Long wordId, String result) {
        Word word = wordRepository.findByIdAndBookId(wordId, bookId).orElse(null);
        if (word == null) {
            return null;
        }

        int currentLevel = word.getReviewLevel() == null || word.getReviewLevel() < 1 ? 1 : word.getReviewLevel();
        int difficultyScore = word.getDifficultyScore() == null ? 0 : word.getDifficultyScore();

        if ("hard".equalsIgnoreCase(result)) {
            currentLevel = Math.max(1, currentLevel - 1);
            difficultyScore = Math.min(10, difficultyScore + 1);
        } else if ("okay".equalsIgnoreCase(result)) {
            // Okay is a stabilizer: no level change, just reschedule at current level
        } else if ("easy".equalsIgnoreCase(result)) {
            LocalDate today = LocalDate.now();
            LocalDate progressDate = word.getLevelProgressDate();
            int progressCount = word.getLevelProgressCount() == null ? 0 : word.getLevelProgressCount();

            if (progressDate == null || !progressDate.equals(today)) {
                progressDate = today;
                progressCount = 0;
            }

            if (progressCount < 2 && currentLevel < 6) {
                currentLevel = currentLevel + 1;
                progressCount++;
            }

            word.setLevelProgressDate(progressDate);
            word.setLevelProgressCount(progressCount);
            difficultyScore = Math.max(0, difficultyScore - 1);
        }

        LocalDateTime now = LocalDateTime.now();
        word.setReviewLevel(currentLevel);
        word.setDifficultyScore(difficultyScore);
        word.setLastReviewedTime(now);
        word.setNextReviewTime(calculateNextReviewTime(now, currentLevel, difficultyScore));
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

    private LocalDateTime calculateNextReviewTime(LocalDateTime baseTime, int level, int difficultyScore) {
        int baseMinutes = switch (level) {
            case 1 -> 10;
            case 2 -> 1440;      // 1 day in minutes
            case 3 -> 4320;      // 3 days
            case 4 -> 10080;     // 7 days
            case 5 -> 20160;     // 14 days
            default -> 43200;    // 30 days
        };

        // Scale by difficulty: harder words (high score) get longer intervals
        double scale = 1.0;
        if (difficultyScore >= 8) scale = 1.5;      // 50% longer for very difficult
        else if (difficultyScore >= 5) scale = 1.25; // 25% longer for difficult
        else if (difficultyScore <= 2) scale = 0.7;  // 30% shorter for very easy

        int adjustedMinutes = (int) (baseMinutes * scale);
        return baseTime.plusMinutes(adjustedMinutes);
    }

    public List<Word> getDueWords(Long bookId) {
        return wordRepository.findDueWordsPrioritizedByDifficulty(bookId, LocalDateTime.now());
    }

    public void clearWords(Long bookId) {
        wordRepository.deleteByBookId(bookId);
    }
}
