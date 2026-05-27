package com.example.vocab.repository;

import com.example.vocab.model.MCQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MCQuestionRepository extends JpaRepository<MCQuestion, Long> {
}
