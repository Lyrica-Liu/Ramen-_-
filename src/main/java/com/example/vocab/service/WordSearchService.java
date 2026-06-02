package com.example.vocab.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class WordSearchService {
    private static final Logger logger = LoggerFactory.getLogger(WordSearchService.class);
    private static final String API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

    private final RestTemplate restTemplate;

    public WordSearchService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /* ── shared HTTP fetch — one round-trip per unique term ── */

    private List<Map<String, Object>> fetchRaw(String normalized) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> resp = restTemplate.getForObject(API_URL + normalized, List.class);
            return resp != null ? resp : List.of();
        } catch (Exception e) {
            logger.warn("Dictionary API error for '{}': {}", normalized, e.getMessage());
            return List.of();
        }
    }

    /* ── public methods, each cached independently ── */

    @Cacheable(value = "dict-all", key = "#term.toLowerCase().trim()")
    public AllMeaningsResult searchAllMeanings(String term) {
        List<Map<String, Object>> resp = fetchRaw(term.toLowerCase().trim());
        if (resp.isEmpty()) return null;

        Map<String, Object> entry = resp.get(0);
        String word = (String) entry.get("word");
        List<MeaningEntry> meanings = new ArrayList<>();

        if (entry.get("meanings") instanceof List<?>) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rawMeanings = (List<Map<String, Object>>) entry.get("meanings");
            for (Map<String, Object> meaning : rawMeanings) {
                String pos = (String) meaning.getOrDefault("partOfSpeech", "");
                if (!(meaning.get("definitions") instanceof List<?>)) continue;
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> rawDefs = (List<Map<String, Object>>) meaning.get("definitions");
                for (Map<String, Object> def : rawDefs) {
                    String definition = (String) def.getOrDefault("definition", "");
                    if (definition == null || definition.isEmpty()) continue;
                    String example = def.get("example") instanceof String s ? s : "";
                    meanings.add(new MeaningEntry(pos, definition, example));
                }
            }
        }

        return new AllMeaningsResult(word != null ? word : term, meanings);
    }

    @Cacheable(value = "dict-simple", key = "#term.toLowerCase().trim()")
    public WordSearchResult searchWord(String term) {
        List<Map<String, Object>> resp = fetchRaw(term.toLowerCase().trim());
        if (resp.isEmpty()) return null;

        Map<String, Object> entry = resp.get(0);
        String word = (String) entry.get("word");
        String definition = "";
        String example = "";

        if (entry.get("meanings") instanceof List<?>) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rawMeanings = (List<Map<String, Object>>) entry.get("meanings");
            if (!rawMeanings.isEmpty()) {
                Map<String, Object> meaning = rawMeanings.get(0);
                if (meaning.get("definitions") instanceof List<?>) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> rawDefs = (List<Map<String, Object>>) meaning.get("definitions");
                    if (!rawDefs.isEmpty()) {
                        Map<String, Object> def = rawDefs.get(0);
                        definition = (String) def.getOrDefault("definition", "");
                        example = def.get("example") instanceof String s ? s : "";
                    }
                }
            }
        }

        return new WordSearchResult(word != null ? word : term, definition, example, "freedictionary.dev");
    }

    /* ── result types ── */

    public static class WordSearchResult {
        private final String term, definition, example, apiSource;

        public WordSearchResult(String term, String definition, String example, String apiSource) {
            this.term = term; this.definition = definition;
            this.example = example; this.apiSource = apiSource;
        }

        public String getTerm()       { return term; }
        public String getDefinition() { return definition; }
        public String getExample()    { return example; }
        public String getApiSource()  { return apiSource; }
    }

    public static class MeaningEntry {
        private final String partOfSpeech, definition, example;

        public MeaningEntry(String partOfSpeech, String definition, String example) {
            this.partOfSpeech = partOfSpeech; this.definition = definition; this.example = example;
        }

        public String getPartOfSpeech() { return partOfSpeech; }
        public String getDefinition()   { return definition; }
        public String getExample()      { return example; }
    }

    public static class AllMeaningsResult {
        private final String term;
        private final List<MeaningEntry> meanings;

        public AllMeaningsResult(String term, List<MeaningEntry> meanings) {
            this.term = term; this.meanings = meanings;
        }

        public String getTerm()                 { return term; }
        public List<MeaningEntry> getMeanings() { return meanings; }
    }
}
