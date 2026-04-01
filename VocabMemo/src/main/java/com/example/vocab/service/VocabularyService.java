package com.example.vocab.service;

import com.example.vocab.dto.PageResponse;
import com.example.vocab.model.VocabularyBook;
import com.example.vocab.model.Word;
import com.example.vocab.repository.WordRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    public VocabularyService(WordRepository wordRepository, BookService bookService, ProgressService progressService) {
        this.wordRepository = wordRepository;
        this.bookService = bookService;
        this.progressService = progressService;
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

    public PageResponse<Word> listWordsPaged(Long bookId, int page, int size) {
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by("position").ascending());
        Page<Word> result = wordRepository.findByBookId(bookId, pageable);

        LocalDateTime now = LocalDateTime.now();
        boolean changed = false;
        List<Word> content = result.getContent();
        for (Word word : content) {
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
            wordRepository.saveAll(content);
        }

        return new PageResponse<>(content, result.getTotalElements(), page, size);
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
            word.setNextReviewTime(now);
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
            currentLevel = 1;
            difficultyScore = Math.min(10, difficultyScore + 1);
        } else {
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
        word.setNextReviewTime(calculateNextReviewTime(now, currentLevel));
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

    private LocalDateTime calculateNextReviewTime(LocalDateTime baseTime, int level) {
        return switch (level) {
            case 1 -> baseTime.plusMinutes(10);
            case 2 -> baseTime.plusDays(1);
            case 3 -> baseTime.plusDays(3);
            case 4 -> baseTime.plusDays(7);
            case 5 -> baseTime.plusDays(14);
            default -> baseTime.plusDays(30);
        };
    }

    public void clearWords(Long bookId) {
        wordRepository.deleteByBookId(bookId);
    }
}
