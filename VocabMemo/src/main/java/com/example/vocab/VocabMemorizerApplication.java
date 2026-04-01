package com.example.vocab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class VocabMemorizerApplication {
    public static void main(String[] args) {
        System.setProperty("spring.h2.console.enabled", "false");
        SpringApplication.run(VocabMemorizerApplication.class, args);
    }
}
