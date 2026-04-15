package com.example.vocab.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Word {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String term;

    @Column(nullable = false)
    private String translation;

    private Integer position;

    private Integer reviewLevel;

    private LocalDateTime nextReviewTime;

    private LocalDateTime lastReviewedTime;

    private LocalDateTime createdTime;

    private LocalDate levelProgressDate;

    private Integer levelProgressCount;

    private LocalDate reviewCountedDate;

    private Integer difficultyScore;

    /** Which offset slot this word is currently at in its batch schedule (0-based). */
    private Integer offsetIndex;

    /** Number of times this word has been answered incorrectly (hard). */
    private Integer errorCount;

    /** The batch this word belongs to; null for words added before batches were introduced. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    @JsonIgnore
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    @JsonIgnore
    private VocabularyBook book;

    public Word() {}

    public Word(String term, String translation) {
        this.term = term;
        this.translation = translation;
        this.reviewLevel = 1;
        LocalDateTime now = LocalDateTime.now();
        this.nextReviewTime = now;
        this.createdTime = now;
        this.levelProgressDate = now.toLocalDate();
        this.levelProgressCount = 0;
        this.difficultyScore = 0;
        this.offsetIndex = 0;
        this.errorCount = 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }

    public String getTranslation() { return translation; }
    public void setTranslation(String translation) { this.translation = translation; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public Integer getReviewLevel() { return reviewLevel; }
    public void setReviewLevel(Integer reviewLevel) { this.reviewLevel = reviewLevel; }

    public LocalDateTime getNextReviewTime() { return nextReviewTime; }
    public void setNextReviewTime(LocalDateTime nextReviewTime) { this.nextReviewTime = nextReviewTime; }

    public LocalDateTime getLastReviewedTime() { return lastReviewedTime; }
    public void setLastReviewedTime(LocalDateTime lastReviewedTime) { this.lastReviewedTime = lastReviewedTime; }

    public LocalDateTime getCreatedTime() { return createdTime; }
    public void setCreatedTime(LocalDateTime createdTime) { this.createdTime = createdTime; }

    public LocalDate getLevelProgressDate() { return levelProgressDate; }
    public void setLevelProgressDate(LocalDate levelProgressDate) { this.levelProgressDate = levelProgressDate; }

    public Integer getLevelProgressCount() { return levelProgressCount; }
    public void setLevelProgressCount(Integer levelProgressCount) { this.levelProgressCount = levelProgressCount; }

    public LocalDate getReviewCountedDate() { return reviewCountedDate; }
    public void setReviewCountedDate(LocalDate reviewCountedDate) { this.reviewCountedDate = reviewCountedDate; }

    public Integer getDifficultyScore() { return difficultyScore; }
    public void setDifficultyScore(Integer difficultyScore) { this.difficultyScore = difficultyScore; }

    public Integer getOffsetIndex() { return offsetIndex; }
    public void setOffsetIndex(Integer offsetIndex) { this.offsetIndex = offsetIndex; }

    public Integer getErrorCount() { return errorCount; }
    public void setErrorCount(Integer errorCount) { this.errorCount = errorCount; }

    public Batch getBatch() { return batch; }
    public void setBatch(Batch batch) { this.batch = batch; }

    public VocabularyBook getBook() { return book; }
    public void setBook(VocabularyBook book) { this.book = book; }
}
