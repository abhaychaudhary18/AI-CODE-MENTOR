package com.aicodementor.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class GeminiAIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public Mono<String> getExplanation(String language, String code, String output, String error) {
        return Mono.fromCallable(() -> callGeminiApi(language, code, output, error))
                .subscribeOn(Schedulers.boundedElastic());
    }

    private String callGeminiApi(String language, String code, String output, String error) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append(String.format(
            "You are an expert AI coding assistant. Please analyze the following %s code.\n\nCode:\n```\n%s\n```\n\n",
            language, code));

        if (error != null && !error.trim().isEmpty()) {
            promptBuilder.append(String.format(
                "The code failed with this error:\n```\n%s\n```\n" +
                "Please rigorously use standard Markdown formatting (such as headings, bullet points, and code blocks) " +
                "to thoroughly explain why this error occurred. You MUST include a distinct section titled " +
                "\"### Suggested Fix\" containing the corrected version of the code.", error));
        } else {
            promptBuilder.append(String.format(
                "The code executed successfully with the following Output:\n```\n%s\n```\n" +
                "Please rigorously use standard Markdown formatting (such as headings and bullet points) to provide " +
                "a clear explanation of what the code does, comment on its time complexity, and suggest any ways " +
                "to optimize or improve it.", output));
        }

        try {
            // Build JSON body manually to avoid Jackson dependency
            String escapedPrompt = promptBuilder.toString()
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");

            String jsonBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + escapedPrompt + "\"}]}]}";
            String uri = geminiApiUrl + "?key=" + apiKey;

            System.out.println("Calling Gemini via native HttpClient: " + uri.substring(0, uri.indexOf("?key=")));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uri))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("Gemini response status: " + response.statusCode());

            if (response.statusCode() == 200) {
                // Extract text using simple string parsing
                String body = response.body();
                int textIdx = body.indexOf("\"text\":");
                if (textIdx >= 0) {
                    int start = body.indexOf('"', textIdx + 7) + 1;
                    // Find closing quote, accounting for escaped quotes
                    int end = start;
                    while (end < body.length()) {
                        if (body.charAt(end) == '"' && body.charAt(end - 1) != '\\') break;
                        end++;
                    }
                    return body.substring(start, end)
                        .replace("\\n", "\n")
                        .replace("\\t", "\t")
                        .replace("\\\"", "\"")
                        .replace("\\\\", "\\");
                }
                return "Could not parse AI response.";
            } else if (response.statusCode() == 429) {
                return "⚠️ **AI Rate Limit Reached**\n\n" +
                       "Google's Gemini API has temporarily limited requests for your free-tier key.\n\n" +
                       "> Please wait **60 seconds** and click Run Code again.\n\n" +
                       "_The code execution above completed successfully — only the AI analysis was affected._";
            } else if (response.statusCode() == 503 || response.statusCode() == 504) {
                System.err.println("Gemini 503 body: " + response.body());
                return "⚠️ **AI Service High Demand**\n\n" +
                       "Google's Gemini model is currently experiencing high demand.\n\n" +
                       "> Please click **Run Code** again in a few seconds.\n\n" +
                       "_The code execution above completed successfully._";
            } else {
                System.err.println("Gemini error body: " + response.body());
                return "AI Service Error [" + response.statusCode() + "]: " + response.body();
            }
        } catch (Exception e) {
            System.err.println("Gemini exception: " + e.getMessage());
            return "AI Service Error: " + e.getMessage();
        }
    }
}
