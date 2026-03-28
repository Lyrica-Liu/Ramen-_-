package com.example.vocab.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class VocabularyBook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("position asc")
    private List<Word> words = new ArrayList<>();

    public VocabularyBook() {}

    public VocabularyBook(String title) {
        this.title = title;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<Word> getWords() { return words; }
    public void setWords(List<Word> words) { this.words = words; }

    public void addWord(Word word) {
        word.setBook(this);
        word.setPosition(words.size());
        words.add(word);
    }
}
