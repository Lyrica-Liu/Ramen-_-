package com.example.vocab.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class WordSearchService {
    private static final Logger logger = LoggerFactory.getLogger(WordSearchService.class);
    private static final String API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

    public WordSearchResult searchWord(String term) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = API_URL + term.toLowerCase().trim();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);

            if (response == null || response.isEmpty()) {
                return null;
            }

            Map<String, Object> wordData = response.get(0);
            String word = (String) wordData.get("word");

            String definition = "";
            String example = "";

            if (wordData.containsKey("meanings") && wordData.get("meanings") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> meanings = (List<Map<String, Object>>) wordData.get("meanings");
                if (!meanings.isEmpty()) {
                    Map<String, Object> meaning = meanings.get(0);
                    if (meaning.containsKey("definitions") && meaning.get("definitions") instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> definitions = (List<Map<String, Object>>) meaning.get("definitions");
                        if (!definitions.isEmpty()) {
                            Map<String, Object> def = definitions.get(0);
                            definition = (String) def.getOrDefault("definition", "");
                            example = (String) def.getOrDefault("example", "");
                        }
                    }
                }
            }

            return new WordSearchResult(word, definition, example, "freedictionary.dev");
        } catch (Exception e) {
            logger.error("Error searching word: " + term, e);
            return null;
        }
    }

    public static class WordSearchResult {
        private String term;
        private String definition;
        private String example;
        private String apiSource;

        public WordSearchResult(String term, String definition, String example, String apiSource) {
            this.term = term;
            this.definition = definition;
            this.example = example;
            this.apiSource = apiSource;
        }

        public String getTerm() { return term; }
        public String getDefinition() { return definition; }
        public String getExample() { return example; }
        public String getApiSource() { return apiSource; }
    }
}
