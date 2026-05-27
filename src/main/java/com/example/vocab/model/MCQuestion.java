package com.example.vocab.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class MCQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String correctAnswer;

    @ElementCollection
    @CollectionTable(name = "mc_distractors", joinColumns = @JoinColumn(name = "mc_question_id"))
    @Column(name = "distractor")
    private List<String> distractors = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id")
    @JsonIgnore
    private Word word;

    private LocalDateTime createdAt;

    public MCQuestion() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public List<String> getDistractors() { return distractors; }
    public void setDistractors(List<String> distractors) { this.distractors = distractors; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public Word getWord() { return word; }
    public void setWord(Word word) { this.word = word; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
