package com.aicodementor.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    public GeminiAIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<String> getExplanation(String language, String code, String output, String error) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(String.format("You are an expert AI coding assistant. Please analyze the following %s code.\n\nCode:\n```\n%s\n```\n\n", language, code));
        
        if (error != null && !error.trim().isEmpty()) {
            promptBuilder.append(String.format("The code failed with this error:\n```\n%s\n```\nPlease thoroughly explain why this error occurred and provide a corrected version of the code.", error));
        } else {
            promptBuilder.append(String.format("The code executed successfully with the following Output:\n```\n%s\n```\nPlease provide a brief explanation of what the code does, comment on its time complexity, and suggest any ways to optimize or improve it.", output));
        }

        Map<String, Object> part = new HashMap<>();
        part.put("text", promptBuilder.toString());

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(content));

        String uri = geminiApiUrl + "?key=" + apiKey;

        return webClient.post()
                .uri(uri)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .map(map -> {
                    try {
                        List<Map<String, Object>> resCandidates = (List<Map<String, Object>>) map.get("candidates");
                        Map<String, Object> resContent = (Map<String, Object>) resCandidates.get(0).get("content");
                        List<Map<String, Object>> resParts = (List<Map<String, Object>>) resContent.get("parts");
                        return resParts.get(0).get("text").toString();
                    } catch (Exception e) {
                        return "Failed to parse AI response. " + e.getMessage();
                    }
                })
                .onErrorResume(e -> Mono.just("AI Service Communication Error: " + e.getMessage()));
    }
}
