package com.example.vocab.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class ViewController {

    @GetMapping({"/", "/bookshelf"})
    public String bookshelf() {
        return "bookshelf";
    }

    @GetMapping("/book/{bookId}")
    public String book(@PathVariable("bookId") Long bookId) {
        return "book-view";
    }

    @GetMapping("/book")
    public String bookRoot() {
        return "redirect:/bookshelf";
    }
}
