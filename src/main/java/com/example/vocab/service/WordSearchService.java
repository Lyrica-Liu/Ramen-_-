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

            if (response == null || response.isEmpty()) return null;

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
                            Object exObj = def.get("example");
                            example = exObj instanceof String ? (String) exObj : "";
                        }
                    }
                }
            }

            return new WordSearchResult(word != null ? word : term, definition, example, "freedictionary.dev");
        } catch (Exception e) {
            logger.error("Error searching word: " + term, e);
            return null;
        }
    }

    public AllMeaningsResult searchAllMeanings(String term) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = API_URL + term.toLowerCase().trim();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);

            if (response == null || response.isEmpty()) return null;

            Map<String, Object> wordData = response.get(0);
            String word = (String) wordData.get("word");
            List<MeaningEntry> meanings = new ArrayList<>();

            if (wordData.containsKey("meanings") && wordData.get("meanings") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> meaningsData = (List<Map<String, Object>>) wordData.get("meanings");
                for (Map<String, Object> meaning : meaningsData) {
                    String partOfSpeech = (String) meaning.getOrDefault("partOfSpeech", "");
                    if (!(meaning.get("definitions") instanceof List)) continue;
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> defs = (List<Map<String, Object>>) meaning.get("definitions");
                    for (Map<String, Object> def : defs) {
                        String definition = (String) def.getOrDefault("definition", "");
                        if (definition == null || definition.isEmpty()) continue;
                        Object exObj = def.get("example");
                        String example = exObj instanceof String ? (String) exObj : "";
                        meanings.add(new MeaningEntry(partOfSpeech, definition, example));
                    }
                }
            }

            return new AllMeaningsResult(word != null ? word : term, meanings);
        } catch (Exception e) {
            logger.error("Error searching all meanings for: " + term, e);
            return null;
        }
    }

    public static class WordSearchResult {
        private final String term;
        private final String definition;
        private final String example;
        private final String apiSource;

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

    public static class MeaningEntry {
        private final String partOfSpeech;
        private final String definition;
        private final String example;

        public MeaningEntry(String partOfSpeech, String definition, String example) {
            this.partOfSpeech = partOfSpeech;
            this.definition = definition;
            this.example = example;
        }

        public String getPartOfSpeech() { return partOfSpeech; }
        public String getDefinition() { return definition; }
        public String getExample() { return example; }
    }

    public static class AllMeaningsResult {
        private final String term;
        private final List<MeaningEntry> meanings;

        public AllMeaningsResult(String term, List<MeaningEntry> meanings) {
            this.term = term;
            this.meanings = meanings;
        }

        public String getTerm() { return term; }
        public List<MeaningEntry> getMeanings() { return meanings; }
    }
}
