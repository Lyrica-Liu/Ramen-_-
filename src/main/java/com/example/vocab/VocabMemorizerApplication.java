package com.example.vocab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class VocabMemorizerApplication {
    public static void main(String[] args) {
        SpringApplication.run(VocabMemorizerApplication.class, args);
    }
}
