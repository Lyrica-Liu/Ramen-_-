package com.example.vocab.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ViewController {

    @GetMapping(value = {"/{path:^(?!api).*}", "/{path:^(?!api).*}/**"}, produces = MediaType.TEXT_HTML_VALUE)
    public Resource forward() {
        return new ClassPathResource("static/index.html");
    }
}
