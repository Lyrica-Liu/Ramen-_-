package com.example.vocab.service;

import com.example.vocab.model.VocabularyBook;
import com.example.vocab.repository.BookDailyProgressRepository;
import com.example.vocab.repository.VocabularyBookRepository;
import com.example.vocab.repository.WordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {
    private final VocabularyBookRepository bookRepository;
    private final BookDailyProgressRepository progressRepository;
    private final WordRepository wordRepository;

    public BookService(VocabularyBookRepository bookRepository,
                       BookDailyProgressRepository progressRepository,
                       WordRepository wordRepository) {
        this.bookRepository = bookRepository;
        this.progressRepository = progressRepository;
        this.wordRepository = wordRepository;
    }

    public List<VocabularyBook> listBooks() {
        return bookRepository.findAll();
    }

    public VocabularyBook createBook(String title) {
        return bookRepository.save(new VocabularyBook(title));
    }

    public VocabularyBook getBook(Long id) {
        return bookRepository.findById(id).orElse(null);
    }

    public VocabularyBook updateBookTitle(Long id, String title) {
        VocabularyBook book = bookRepository.findById(id).orElse(null);
        if (book == null) {
            return null;
        }
        book.setTitle(title);
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        wordRepository.deleteByBookId(id);
        progressRepository.deleteByBookId(id);
        bookRepository.deleteById(id);
    }
}
