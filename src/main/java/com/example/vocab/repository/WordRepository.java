package com.example.vocab.repository;

import com.example.vocab.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WordRepository extends JpaRepository<Word, Long> {
    @Query("SELECT w FROM Word w LEFT JOIN FETCH w.apiMetadata WHERE w.book.id = :bookId ORDER BY w.position ASC")
    List<Word> findByBookIdOrderByPositionAsc(@Param("bookId") Long bookId);
    List<Word> findByBookIdAndNextReviewTimeLessThanEqualOrderByNextReviewTimeAsc(Long bookId, LocalDateTime now);
    Optional<Word> findByIdAndBookId(Long id, Long bookId);
    void deleteByBookId(Long bookId);
    long countByBookId(Long bookId);

    @Query("SELECT w FROM Word w WHERE w.book.id = :bookId AND w.nextReviewTime <= :now ORDER BY COALESCE(w.difficultyScore, 0) DESC, w.nextReviewTime ASC")
    List<Word> findDueWordsPrioritizedByDifficulty(@Param("bookId") Long bookId, @Param("now") LocalDateTime now);
}
