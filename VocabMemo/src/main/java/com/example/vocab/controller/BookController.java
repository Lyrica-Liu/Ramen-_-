package com.example.vocab.controller;

import com.example.vocab.model.Book;
import com.example.vocab.model.VocabularyBook;
import com.example.vocab.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin
public class BookController {
    private final BookService bookService;

    private final List<Book> books = new ArrayList<>(List.of(
        new Book(1L, "Spring in Action"),
        new Book(2L, "Clean Code"),
        new Book(3L, "Effective Java")
    ));

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/list")
    public List<Book> getBookList() {
        return books;
    }

    @GetMapping
    public List<VocabularyBook> getBooks() {
        return bookService.listBooks();
    }

    @PostMapping
    public ResponseEntity<VocabularyBook> createBook(@RequestBody VocabularyBook bookRequest) {
        if (bookRequest.getTitle() == null || bookRequest.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        VocabularyBook book = bookService.createBook(bookRequest.getTitle().trim());
        return ResponseEntity.ok(book);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VocabularyBook> getBook(@PathVariable("id") Long id) {
        VocabularyBook book = bookService.getBook(id);
        if (book == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(book);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable("id") Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<VocabularyBook> updateBook(
            @PathVariable("id") Long id,
            @RequestBody VocabularyBook payload
    ) {
        if (payload == null || payload.getTitle() == null || payload.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        VocabularyBook updated = bookService.updateBookTitle(id, payload.getTitle().trim());
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }
}
