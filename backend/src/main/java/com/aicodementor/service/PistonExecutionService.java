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

    @Value("${piston.api.url}")
    private String pistonApiUrl;

    public PistonExecutionService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<ExecutionResponse> execute(ExecutionRequest request) {
        if ("python".equals(request.getLanguage())) {
            return executePythonLocally(request);
        }

        String wandboxUrl = "https://wandbox.org/api/compile.json";
        
        Map<String, String> compilerMap = new HashMap<>();
        compilerMap.put("python", "cpython-3.13.8");
        compilerMap.put("javascript", "nodejs-20.17.0");
        compilerMap.put("java", "openjdk-jdk-22+36");
        compilerMap.put("c", "gcc-13.2.0-c");
        compilerMap.put("cpp", "gcc-13.2.0");

        String compiler = compilerMap.getOrDefault(request.getLanguage(), "cpython-3.13.8");

        Map<String, Object> body = new HashMap<>();
        body.put("compiler", compiler);
        body.put("code", request.getCode());
        if (request.getStdin() != null && !request.getStdin().isEmpty()) {
            body.put("stdin", request.getStdin());
        }

        return webClient.post()
                .uri(wandboxUrl)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .map(responseJson -> {
                    ExecutionResponse response = new ExecutionResponse();
                    try {
                        JsonParser parser = JsonParserFactory.getJsonParser();
                        Map<String, Object> resultMap = parser.parseMap(responseJson);
                        String programMessage = resultMap.get("program_message") != null ? resultMap.get("program_message").toString() : "";
                        String compilerMessage = resultMap.get("compiler_message") != null ? resultMap.get("compiler_message").toString() : "";
                        String compilerError = resultMap.get("compiler_error") != null ? resultMap.get("compiler_error").toString() : "";
                        String programError = resultMap.get("program_error") != null ? resultMap.get("program_error").toString() : "";
                        
                        String statusStr = resultMap.get("status") != null ? resultMap.get("status").toString() : "0";
                        boolean isError = !statusStr.equals("0") || !compilerError.isEmpty() || !programError.isEmpty();
                        
                        String combinedError = !compilerError.isEmpty() ? compilerError : programError;
                        String combinedOutput = !programMessage.isEmpty() ? programMessage : compilerMessage;
                        
                        response.setIsError(isError);
                        response.setOutput(combinedOutput);
                        response.setError(combinedError);
                    } catch (Exception e) {
                        response.setIsError(true);
                        response.setError(e.getMessage());
                    }
                    return response;
                }).onErrorResume(e -> {
                    ExecutionResponse response = new ExecutionResponse();
                    response.setIsError(true);
                    response.setError(e.getMessage());
                    return Mono.just(response);
                });
    }

    private Mono<ExecutionResponse> executePythonLocally(ExecutionRequest request) {
        return Mono.fromCallable(() -> {
            ExecutionResponse response = new ExecutionResponse();
            try {
                java.nio.file.Path tempScript = java.nio.file.Files.createTempFile("script", ".py");
                String finalCode = "import os\nimport sys\ntry:\n    import matplotlib\n    matplotlib.use('Agg')\nexcept:\n    pass\n" + request.getCode();
                java.nio.file.Files.writeString(tempScript, finalCode);
                
                ProcessBuilder pb = new ProcessBuilder("python3", tempScript.toAbsolutePath().toString());
                pb.directory(new java.io.File(System.getProperty("java.io.tmpdir")));
                Process process = pb.start();
                
                if (request.getStdin() != null && !request.getStdin().isEmpty()) {
                    java.io.OutputStream os = process.getOutputStream();
                    os.write(request.getStdin().getBytes());
                    os.flush();
                    os.close();
                }
                
                String output = new String(process.getInputStream().readAllBytes());
                String error = new String(process.getErrorStream().readAllBytes());
                int exitCode = process.waitFor();
                
                response.setIsError(exitCode != 0 || !error.isEmpty());
                response.setOutput(output);
                response.setError(error);
                
                java.nio.file.Files.deleteIfExists(tempScript);
            } catch (Exception e) {
                response.setIsError(true);
                response.setError("Local Python Execution Failed: " + e.getMessage());
            }
            return response;
        });
    }
}
