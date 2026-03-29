package com.example.vocab.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping({"/", "/bookshelf", "/book/**"})
    public String forwardToSpa() {
        return "forward:/index.html";
    }
}
