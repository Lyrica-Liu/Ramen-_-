package com.example.vocab.service;

import com.example.vocab.model.VocabularyBook;
import com.example.vocab.repository.BookDailyProgressRepository;
import com.example.vocab.repository.VocabularyBookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {
    private final VocabularyBookRepository bookRepository;
    private final BookDailyProgressRepository progressRepository;

    public BookService(VocabularyBookRepository bookRepository, BookDailyProgressRepository progressRepository) {
        this.bookRepository = bookRepository;
        this.progressRepository = progressRepository;
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

    public void deleteBook(Long id) {
        progressRepository.deleteByBookId(id);
        bookRepository.deleteById(id);
    }
}
