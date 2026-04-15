package com.example.vocab.repository;

import com.example.vocab.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByBookId(Long bookId);
}
