package com.example.vocab.repository;

import com.example.vocab.model.VocabularyBook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VocabularyBookRepository extends JpaRepository<VocabularyBook, Long> {
    List<VocabularyBook> findByUserId(Long userId);
    Optional<VocabularyBook> findByIdAndUserId(Long id, Long userId);
}
