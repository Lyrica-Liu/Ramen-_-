package com.example.vocab.service;

import com.example.vocab.model.BookDailyProgress;
import com.example.vocab.model.VocabularyBook;
import com.example.vocab.repository.BookDailyProgressRepository;
import com.example.vocab.repository.VocabularyBookRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ProgressService {
    private final BookDailyProgressRepository progressRepository;
    private final VocabularyBookRepository bookRepository;

    public ProgressService(BookDailyProgressRepository progressRepository, VocabularyBookRepository bookRepository) {
        this.progressRepository = progressRepository;
        this.bookRepository = bookRepository;
    }

    public static class ProgressHeader {
        private final int addedToday;
        private final int reviewedToday;
        private final int streak;

        public ProgressHeader(int addedToday, int reviewedToday, int streak) {
            this.addedToday = addedToday;
            this.reviewedToday = reviewedToday;
            this.streak = streak;
        }

        public int getAddedToday() {
            return addedToday;
        }

        public int getReviewedToday() {
            return reviewedToday;
        }

        public int getStreak() {
            return streak;
        }
    }

    public static class DailyProgressSummary {
        private final String date;
        private final int reviewedCount;
        private final int addedCount;

        public DailyProgressSummary(String date, int reviewedCount, int addedCount) {
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

    public ProgressHeader getHeader(Long bookId) {
        LocalDate today = LocalDate.now();
        BookDailyProgress todayProgress = progressRepository.findByBookIdAndActivityDate(bookId, today).orElse(null);
        int addedToday = todayProgress != null && todayProgress.getAddedCount() != null ? todayProgress.getAddedCount() : 0;
        int reviewedToday = todayProgress != null && todayProgress.getReviewedCount() != null ? todayProgress.getReviewedCount() : 0;
        int streak = calculateCurrentStreak();
        return new ProgressHeader(addedToday, reviewedToday, streak);
    }

    public ProgressHeader recordAddedWords(Long bookId, int amount) {
        if (amount <= 0) {
            return getHeader(bookId);
        }
        BookDailyProgress progress = getOrCreateDailyProgress(bookId, LocalDate.now());
        int current = progress.getAddedCount() == null ? 0 : progress.getAddedCount();
        progress.setAddedCount(current + amount);
        progressRepository.save(progress);
        return getHeader(bookId);
    }

    public ProgressHeader recordReviewActivity(Long bookId, int amount) {
        if (amount <= 0) {
            return getHeader(bookId);
        }
        BookDailyProgress progress = getOrCreateDailyProgress(bookId, LocalDate.now());
        int current = progress.getReviewedCount() == null ? 0 : progress.getReviewedCount();
        progress.setReviewedCount(current + amount);
        progressRepository.save(progress);
        return getHeader(bookId);
    }

    public List<DailyProgressSummary> getDailyProgress(Long bookId, int days) {
        int safeDays = Math.max(1, Math.min(days, 90));
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(safeDays - 1L);
        List<BookDailyProgress> progressEntries = progressRepository.findByBookIdAndActivityDateBetweenOrderByActivityDateAsc(bookId, startDate, today);

        Map<LocalDate, DailyProgressAccumulator> map = new LinkedHashMap<>();
        for (int offset = safeDays - 1; offset >= 0; offset--) {
            LocalDate date = today.minusDays(offset);
            map.put(date, new DailyProgressAccumulator());
        }

        for (BookDailyProgress entry : progressEntries) {
            DailyProgressAccumulator acc = map.get(entry.getActivityDate());
            if (acc == null) {
                continue;
            }
            acc.addedCount = entry.getAddedCount() == null ? 0 : entry.getAddedCount();
            acc.reviewedCount = entry.getReviewedCount() == null ? 0 : entry.getReviewedCount();
        }

        List<DailyProgressSummary> result = new ArrayList<>();
        for (Map.Entry<LocalDate, DailyProgressAccumulator> entry : map.entrySet()) {
            DailyProgressAccumulator acc = entry.getValue();
            result.add(new DailyProgressSummary(entry.getKey().toString(), acc.reviewedCount, acc.addedCount));
        }
        return result;
    }

    public void clearProgress(Long bookId) {
        progressRepository.deleteByBookId(bookId);
    }

    private int calculateCurrentStreak() {
        LocalDate today = LocalDate.now();
        Map<LocalDate, Boolean> studiedByDate = new LinkedHashMap<>();
        for (BookDailyProgress entry : progressRepository.findAllByOrderByActivityDateDesc()) {
            if (!entry.hasStudyActivity()) {
                continue;
            }
            studiedByDate.put(entry.getActivityDate(), true);
        }

        if (!Boolean.TRUE.equals(studiedByDate.get(today))) {
            return 0;
        }

        int streak = 0;
        LocalDate cursor = today;
        while (true) {
            if (!Boolean.TRUE.equals(studiedByDate.get(cursor))) {
                break;
            }
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private BookDailyProgress getOrCreateDailyProgress(Long bookId, LocalDate date) {
        return progressRepository.findByBookIdAndActivityDate(bookId, date)
                .orElseGet(() -> new BookDailyProgress(getRequiredBook(bookId), date));
    }

    private VocabularyBook getRequiredBook(Long bookId) {
        return bookRepository.findById(Objects.requireNonNull(bookId))
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
    }

    private static class DailyProgressAccumulator {
        int reviewedCount;
        int addedCount;
    }
}
