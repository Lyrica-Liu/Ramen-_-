package com.example.vocab.repository;

import com.example.vocab.model.VocabularyBook;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VocabularyBookRepository extends JpaRepository<VocabularyBook, Long> {
}
