package com.example.vocab.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * A Batch groups words added together on the same day.
 * It carries the review schedule: a list of day-offsets from creation
 * (e.g. "1,3,14" means review after 1 day, then 3 days, then 14 days).
 */
@Entity
@Table(name = "batch")
public class Batch {

    /** Default schedule applied to every new batch. */
    public static final String DEFAULT_OFFSETS = "1,3,14";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate createdAt;

    /** Comma-separated day offsets, e.g. "1,3,14". */
    @Column(nullable = false)
    private String reviewOffsets;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnore
    private VocabularyBook book;

    public Batch() {}

    public Batch(LocalDate createdAt, String reviewOffsets, VocabularyBook book) {
        this.createdAt = createdAt;
        this.reviewOffsets = reviewOffsets;
        this.book = book;
    }

    /** Parses the stored offsets string into a list of integers. */
    public List<Integer> parseOffsets() {
        return Arrays.stream(reviewOffsets.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public String getReviewOffsets() { return reviewOffsets; }
    public void setReviewOffsets(String reviewOffsets) { this.reviewOffsets = reviewOffsets; }

    public VocabularyBook getBook() { return book; }
    public void setBook(VocabularyBook book) { this.book = book; }
}
