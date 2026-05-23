package com.example.vocab.service;

import com.example.vocab.model.User;
import com.example.vocab.model.VocabularyBook;
import com.example.vocab.repository.BookDailyProgressRepository;
import com.example.vocab.repository.UserRepository;
import com.example.vocab.repository.VocabularyBookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {
    private final VocabularyBookRepository bookRepository;
    private final BookDailyProgressRepository progressRepository;
    private final UserRepository userRepository;

    public BookService(VocabularyBookRepository bookRepository,
                       BookDailyProgressRepository progressRepository,
                       UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
    }

    public List<VocabularyBook> listBooks(Long userId) {
        return bookRepository.findByUserId(userId);
    }

    public VocabularyBook createBook(String title, Long userId) {
        User user = userRepository.getReferenceById(userId);
        VocabularyBook book = new VocabularyBook(title);
        book.setUser(user);
        return bookRepository.save(book);
    }

    public VocabularyBook getBook(Long id, Long userId) {
        return bookRepository.findByIdAndUserId(id, userId).orElse(null);
    }

    public VocabularyBook getBook(Long id) {
        return bookRepository.findById(id).orElse(null);
    }

    public VocabularyBook updateBookTitle(Long id, String title, Long userId) {
        VocabularyBook book = bookRepository.findByIdAndUserId(id, userId).orElse(null);
        if (book == null) return null;
        book.setTitle(title);
        return bookRepository.save(book);
    }

    public boolean deleteBook(Long id, Long userId) {
        VocabularyBook book = bookRepository.findByIdAndUserId(id, userId).orElse(null);
        if (book == null) return false;
        progressRepository.deleteByBookId(id);
        bookRepository.deleteById(id);
        return true;
    }
}
