package com.example.vocab.controller;

import com.example.vocab.model.VocabularyBook;
import com.example.vocab.security.UserPrincipal;
import com.example.vocab.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    private Long userId(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getId();
    }

    @GetMapping
    public List<VocabularyBook> getBooks(Authentication auth) {
        return bookService.listBooks(userId(auth));
    }

    @PostMapping
    public ResponseEntity<VocabularyBook> createBook(@RequestBody VocabularyBook req, Authentication auth) {
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(bookService.createBook(req.getTitle().trim(), userId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VocabularyBook> getBook(@PathVariable("id") Long id, Authentication auth) {
        VocabularyBook book = bookService.getBook(id, userId(auth));
        return book != null ? ResponseEntity.ok(book) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<VocabularyBook> updateBook(@PathVariable("id") Long id,
                                                      @RequestBody VocabularyBook payload,
                                                      Authentication auth) {
        if (payload == null || payload.getTitle() == null || payload.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        VocabularyBook updated = bookService.updateBookTitle(id, payload.getTitle().trim(), userId(auth));
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable("id") Long id, Authentication auth) {
        return bookService.deleteBook(id, userId(auth))
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }
}
