package com.aicodementor.service;

import com.aicodementor.model.ExecutionRequest;
import com.aicodementor.model.ExecutionResponse;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PistonExecutionService {

    private final WebClient webClient;

    @Value("${piston.api.url:https://emkc.org/api/v2/piston/execute}")
    private String pistonApiUrl;

    public PistonExecutionService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<ExecutionResponse> execute(ExecutionRequest request) {
        String lang = request.getLanguage().toLowerCase();
        
        // Handle languages that do not require backend execution
        if ("html".equals(lang) || "css".equals(lang)) {
            ExecutionResponse response = new ExecutionResponse();
            response.setIsError(false);
            response.setOutput(lang.toUpperCase() + " does not require backend execution. View your rendered code in the browser.");
            response.setError("");
            return Mono.just(response);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("language", lang);
        body.put("version", "*");
        
        Map<String, String> fileMap = new HashMap<>();
        fileMap.put("content", request.getCode());
        body.put("files", List.of(fileMap));
        
        if (request.getStdin() != null && !request.getStdin().isEmpty()) {
            body.put("stdin", request.getStdin());
        }

        return webClient.post()
                .uri(pistonApiUrl)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(responseJson -> {
                    ExecutionResponse response = new ExecutionResponse();
                    try {
                        JsonParser parser = JsonParserFactory.getJsonParser();
                        Map<String, Object> resultMap = parser.parseMap(responseJson);
                        
                        Map<String, Object> runMap = (Map<String, Object>) resultMap.get("run");
                        Map<String, Object> compileMap = (Map<String, Object>) resultMap.get("compile");
                        
                        String output = "";
                        String error = "";
                        boolean isError = false;

                        if (compileMap != null && compileMap.get("code") != null && !compileMap.get("code").toString().equals("0")) {
                            error = compileMap.get("stderr") != null ? compileMap.get("stderr").toString() : "";
                            output = compileMap.get("stdout") != null ? compileMap.get("stdout").toString() : "";
                            isError = true;
                        } else if (runMap != null) {
                            error = runMap.get("stderr") != null ? runMap.get("stderr").toString() : "";
                            output = runMap.get("output") != null ? runMap.get("output").toString() : "";
                            if (runMap.get("code") != null && !runMap.get("code").toString().equals("0")) {
                                isError = true;
                            }
                        }
                        
                        if (!error.isEmpty() && isError) {
                            response.setIsError(true);
                        } else {
                            response.setIsError(false);
                        }
                        
                        response.setOutput(output);
                        response.setError(error);
                    } catch (Exception e) {
                        response.setIsError(true);
                        response.setError("Failed to parse execution result: " + e.getMessage());
                    }
                    return response;
                }).onErrorResume(e -> {
                    ExecutionResponse response = new ExecutionResponse();
                    response.setIsError(true);
                    response.setError("Execution service error: " + e.getMessage());
                    return Mono.just(response);
                });
    }
}
