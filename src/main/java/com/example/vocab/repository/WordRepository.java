package com.example.vocab.repository;

import com.example.vocab.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WordRepository extends JpaRepository<Word, Long> {
    List<Word> findByBookIdOrderByPositionAsc(Long bookId);
    List<Word> findByBookIdAndNextReviewTimeLessThanEqualOrderByNextReviewTimeAsc(Long bookId, LocalDateTime now);
    Optional<Word> findByIdAndBookId(Long id, Long bookId);
    void deleteByBookId(Long bookId);
}
