package com.example.vocab.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class WordApiMetadata {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id")
    @JsonIgnore
    private Word word;

    private String apiSource;

    @Column(columnDefinition = "TEXT")
    private String apiDefinition;

    @Column(columnDefinition = "TEXT")
    private String exampleSentence;

    private LocalDateTime fetchedAt;

    public WordApiMetadata() {
        this.fetchedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Word getWord() { return word; }
    public void setWord(Word word) { this.word = word; }

    public String getApiSource() { return apiSource; }
    public void setApiSource(String apiSource) { this.apiSource = apiSource; }

    public String getApiDefinition() { return apiDefinition; }
    public void setApiDefinition(String apiDefinition) { this.apiDefinition = apiDefinition; }

    public String getExampleSentence() { return exampleSentence; }
    public void setExampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; }

    public LocalDateTime getFetchedAt() { return fetchedAt; }
    public void setFetchedAt(LocalDateTime fetchedAt) { this.fetchedAt = fetchedAt; }
}
