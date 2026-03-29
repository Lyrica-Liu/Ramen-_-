package com.example.vocab.repository;

import com.example.vocab.model.BookDailyProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookDailyProgressRepository extends JpaRepository<BookDailyProgress, Long> {
    Optional<BookDailyProgress> findByBookIdAndActivityDate(Long bookId, LocalDate activityDate);
    List<BookDailyProgress> findByBookIdAndActivityDateBetweenOrderByActivityDateAsc(Long bookId, LocalDate startDate, LocalDate endDate);
    List<BookDailyProgress> findByBookIdOrderByActivityDateDesc(Long bookId);
    List<BookDailyProgress> findAllByOrderByActivityDateDesc();
    void deleteByBookId(Long bookId);
}
