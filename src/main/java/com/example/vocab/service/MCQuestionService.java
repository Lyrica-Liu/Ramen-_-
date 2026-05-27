package com.example.vocab.service;

import com.example.vocab.model.MCQuestion;
import com.example.vocab.model.Word;
import com.example.vocab.repository.MCQuestionRepository;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MCQuestionService {
    private final MCQuestionRepository mcQuestionRepository;

    public MCQuestionService(MCQuestionRepository mcQuestionRepository) {
        this.mcQuestionRepository = mcQuestionRepository;
    }

    public MCQuestion createMCQuestion(String correctAnswer, List<String> distractors, String explanation) {
        MCQuestion mcQuestion = new MCQuestion();
        mcQuestion.setCorrectAnswer(correctAnswer);
        mcQuestion.setDistractors(distractors);
        mcQuestion.setExplanation(explanation);
        return mcQuestionRepository.save(mcQuestion);
    }

    public MCQuestionOptions getMCOptionsShuffled(MCQuestion mcQuestion) {
        List<String> options = new ArrayList<>();
        options.add(mcQuestion.getCorrectAnswer());
        options.addAll(mcQuestion.getDistractors());

        Collections.shuffle(options);

        int correctIndex = options.indexOf(mcQuestion.getCorrectAnswer());

        return new MCQuestionOptions(options, correctIndex, mcQuestion.getExplanation());
    }

    public static class MCQuestionOptions {
        private List<String> options;
        private int correctIndex;
        private String explanation;

        public MCQuestionOptions(List<String> options, int correctIndex, String explanation) {
            this.options = options;
            this.correctIndex = correctIndex;
            this.explanation = explanation;
        }

        public List<String> getOptions() { return options; }
        public int getCorrectIndex() { return correctIndex; }
        public String getExplanation() { return explanation; }
    }
}
