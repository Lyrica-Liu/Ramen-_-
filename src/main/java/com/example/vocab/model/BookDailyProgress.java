package com.example.vocab.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
        uniqueConstraints = {
        @UniqueConstraint(columnNames = {"book_id", "activity_date"})
        }
)
public class BookDailyProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    private Integer addedCount;

    private Integer reviewedCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private VocabularyBook book;

    public BookDailyProgress() {
    }

    public BookDailyProgress(VocabularyBook book, LocalDate activityDate) {
        this.book = book;
        this.activityDate = activityDate;
        this.addedCount = 0;
        this.reviewedCount = 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
    }

    public Integer getAddedCount() {
        return addedCount;
    }

    public void setAddedCount(Integer addedCount) {
        this.addedCount = addedCount;
    }

    public Integer getReviewedCount() {
        return reviewedCount;
    }

    public void setReviewedCount(Integer reviewedCount) {
        this.reviewedCount = reviewedCount;
    }

    public VocabularyBook getBook() {
        return book;
    }

    public void setBook(VocabularyBook book) {
        this.book = book;
    }

    public boolean hasStudyActivity() {
        return (addedCount != null && addedCount > 0) || (reviewedCount != null && reviewedCount > 0);
    }
}
