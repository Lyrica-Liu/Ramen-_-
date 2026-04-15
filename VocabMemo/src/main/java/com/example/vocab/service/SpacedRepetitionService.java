package com.example.vocab.service;

import com.example.vocab.model.Batch;
import com.example.vocab.model.VocabularyBook;
import com.example.vocab.model.Word;
import com.example.vocab.repository.BatchRepository;
import com.example.vocab.repository.WordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Handles all spaced-repetition scheduling logic.
 *
 * Schedule model
 * ─────────────
 * Each word has a familiarity level [1, 6].
 *
 *   easy  → level + 2 (capped at 6)
 *   okay  → level + 1 (capped at 6)
 *   hard  → level - 1 (floored at 1), increments errorCount
 *
 * Next review interval by level:
 *   1 → 1 day, 2 → 2 days, 3 → 4 days, 4 → 7 days, 5 → 14 days, 6 → 21 days
 *
 * Color coding (handled by frontend):
 *   level 1-2 → red, level 3-4 → yellow, level 5-6 → green
 */
@Service
public class SpacedRepetitionService {

    /** Days until next review for each familiarity level; index 0 is unused. */
    private static final int[] LEVEL_DAYS = {0, 1, 2, 4, 7, 14, 21};

    private final WordRepository wordRepository;
    private final BatchRepository batchRepository;
    private final ProgressService progressService;

    public SpacedRepetitionService(
            WordRepository wordRepository,
            BatchRepository batchRepository,
            ProgressService progressService) {
        this.wordRepository = wordRepository;
        this.batchRepository = batchRepository;
        this.progressService = progressService;
    }

    // ─────────────────────────────── batch creation ───────────────────────────────

    /**
     * Creates a new Batch for the given book using the default offset schedule.
     * Called by VocabularyService when a group of words is added.
     */
    public Batch createBatch(VocabularyBook book) {
        Batch batch = new Batch(LocalDate.now(), Batch.DEFAULT_OFFSETS, book);
        return batchRepository.save(batch);
    }

    /**
     * Assigns all words to the batch and sets their initial nextReviewTime
     * to 1 day from now (level 1 interval).
     */
    public void assignWordsToBatch(List<Word> words, Batch batch) {
        LocalDateTime firstReview = LocalDate.now().plusDays(LEVEL_DAYS[1]).atStartOfDay();

        for (Word word : words) {
            word.setBatch(batch);
            word.setOffsetIndex(0);
            word.setErrorCount(0);
            word.setNextReviewTime(firstReview);
        }
    }

    // ──────────────────────────── daily review query ──────────────────────────────

    /**
     * Returns all words due for review on or before `today`, sorted by:
     *   1. highest errorCount first  (prioritise struggled words)
     *   2. oldest nextReviewTime first (most overdue words next)
     *
     * This merges batch-scheduled reviews and rescheduled (hard) reviews
     * automatically — both are just words with nextReviewTime <= today.
     */
    public List<Word> getDailyReviewWords(Long bookId, LocalDate today) {
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        List<Word> allWords = wordRepository.findByBookIdOrderByPositionAsc(bookId);

        return allWords.stream()
                .filter(w -> w.getNextReviewTime() != null
                        && !w.getNextReviewTime().isAfter(endOfDay))
                .sorted(Comparator
                        // highest errorCount first
                        .comparingInt((Word w) -> -(w.getErrorCount() == null ? 0 : w.getErrorCount()))
                        // then oldest nextReviewTime
                        .thenComparing(Word::getNextReviewTime))
                .collect(Collectors.toList());
    }

    // ─────────────────────────────── review word ──────────────────────────────────

    /**
     * Records a review result for a word, updates its familiarity level, and reschedules it.
     *
     * <pre>
     *   easy → level + 2 (max 6), next review in LEVEL_DAYS[newLevel]
     *   okay → level + 1 (max 6), next review in LEVEL_DAYS[newLevel]
     *   hard → level - 1 (min 1), errorCount++, next review in LEVEL_DAYS[newLevel]
     * </pre>
     *
     * @param result "easy" | "okay" | "hard"
     * @return the updated Word, or null if not found
     */
    public Word reviewWord(Long bookId, Long wordId, String result) {
        Word word = wordRepository.findByIdAndBookId(wordId, bookId).orElse(null);
        if (word == null) return null;

        int level      = word.getReviewLevel() == null || word.getReviewLevel() < 1 ? 1 : word.getReviewLevel();
        int errorCount = word.getErrorCount()  == null ? 0 : word.getErrorCount();

        if ("hard".equalsIgnoreCase(result)) {
            level = Math.max(1, level - 1);
            word.setErrorCount(errorCount + 1);
        } else if ("okay".equalsIgnoreCase(result)) {
            level = Math.min(6, level + 1);
        } else { // easy
            level = Math.min(6, level + 2);
        }

        word.setReviewLevel(level);
        word.setNextReviewTime(LocalDate.now().plusDays(LEVEL_DAYS[level]).atStartOfDay());
        word.setLastReviewedTime(LocalDateTime.now());
        Word saved = wordRepository.save(word);
        progressService.recordReviewActivity(bookId, 1);
        return saved;
    }
}
