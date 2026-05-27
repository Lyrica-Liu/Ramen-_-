package com.example.vocab.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class DistractorGenerationService {

    public List<String> generateDistractors(String correctAnswer, String definition, int count) {
        List<String> allDistractors = new ArrayList<>();

        allDistractors.addAll(generatePhoneticDistr(correctAnswer));
        allDistractors.addAll(generateSemanticDistr(correctAnswer, definition));
        allDistractors.addAll(generateCommonConfusions(correctAnswer));

        return selectRandomDistr(allDistractors, count);
    }

    private List<String> generatePhoneticDistr(String word) {
        List<String> result = new ArrayList<>();

        if (word.length() > 3) {
            result.add(word.substring(0, word.length() - 1) + "ly");
            result.add(word.substring(0, Math.max(1, word.length() - 2)) + "ing");
            result.add(word + "ness");
        }

        if (word.contains("e")) {
            result.add(word.replace("e", "a"));
        }
        if (word.contains("a")) {
            result.add(word.replace("a", "e"));
        }

        return result;
    }

    private List<String> generateSemanticDistr(String word, String definition) {
        List<String> result = new ArrayList<>();
        String lowerDef = definition.toLowerCase();

        if (lowerDef.contains("good") || lowerDef.contains("bad")) {
            if (!word.equalsIgnoreCase("good")) result.add("good");
            if (!word.equalsIgnoreCase("bad")) result.add("bad");
        }

        if (lowerDef.contains("quick") || lowerDef.contains("fast")) {
            if (!word.equalsIgnoreCase("quick")) result.add("quick");
            if (!word.equalsIgnoreCase("slow")) result.add("slow");
        }

        return result;
    }

    private List<String> generateCommonConfusions(String word) {
        Map<String, List<String>> confusions = new HashMap<>();

        confusions.put("coincidentally", Arrays.asList("intentionally", "cautiously", "repeatedly"));
        confusions.put("serendipity", Arrays.asList("misfortune", "preparation", "coincidence"));
        confusions.put("meticulous", Arrays.asList("careless", "quick", "ambitious"));
        confusions.put("ephemeral", Arrays.asList("eternal", "permanent", "temporary"));
        confusions.put("ubiquitous", Arrays.asList("rare", "scarce", "invisible"));
        confusions.put("pragmatic", Arrays.asList("theoretical", "idealistic", "impractical"));
        confusions.put("parsimonious", Arrays.asList("generous", "lavish", "wasteful"));
        confusions.put("melancholic", Arrays.asList("joyful", "energetic", "excited"));
        confusions.put("obfuscate", Arrays.asList("clarify", "simplify", "explain"));
        confusions.put("perspicacious", Arrays.asList("dim-witted", "confused", "obtuse"));

        String lowerWord = word.toLowerCase();
        if (confusions.containsKey(lowerWord)) {
            return new ArrayList<>(confusions.get(lowerWord));
        }

        return Arrays.asList("uncertain", "moderate", "variable");
    }

    private List<String> selectRandomDistr(List<String> allOptions, int count) {
        Set<String> unique = new HashSet<>(allOptions);
        unique.removeIf(opt -> opt == null || opt.isEmpty());

        List<String> shuffled = new ArrayList<>(unique);
        Collections.shuffle(shuffled);

        return shuffled.subList(0, Math.min(count, shuffled.size()));
    }
}
