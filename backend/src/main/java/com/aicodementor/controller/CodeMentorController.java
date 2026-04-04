package com.aicodementor.controller;

import com.aicodementor.model.ExecutionRequest;
import com.aicodementor.model.ExecutionResponse;
import com.aicodementor.model.ExplainRequest;
import com.aicodementor.service.PistonExecutionService;
import com.aicodementor.service.GeminiAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CodeMentorController {

    @Autowired
    private PistonExecutionService executionService;

    @Autowired
    private GeminiAIService aiService;

    @PostMapping("/execute")
    public Mono<ResponseEntity<ExecutionResponse>> executeCode(@RequestBody ExecutionRequest request) {
        return executionService.execute(request)
            .map(ResponseEntity::ok)
            .onErrorResume(e -> {
                ExecutionResponse res = new ExecutionResponse();
                res.setIsError(true);
                res.setError(e.getMessage());
                return Mono.just(ResponseEntity.status(500).body(res));
            });
    }

    @PostMapping("/explain")
    public Mono<ResponseEntity<Map<String, String>>> explainCode(@RequestBody ExplainRequest request) {
         return aiService.getExplanation(request.getLanguage(), request.getCode(), request.getOutput(), request.getError())
            .map(explanation -> {
                Map<String, String> response = new HashMap<>();
                response.put("explanation", explanation);
                return ResponseEntity.ok(response);
            })
            .onErrorReturn(ResponseEntity.status(500).body(Map.of("error", "Error connecting to AI service")));
    }
}
