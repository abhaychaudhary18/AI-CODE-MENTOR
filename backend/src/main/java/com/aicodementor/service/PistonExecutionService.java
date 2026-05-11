package com.aicodementor.service;

import com.aicodementor.model.ExecutionRequest;
import com.aicodementor.model.ExecutionResponse;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.*;
import java.nio.file.*;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class PistonExecutionService {

    public Mono<ExecutionResponse> execute(ExecutionRequest request) {
        return Mono.fromCallable(() -> runLocally(request))
                .subscribeOn(Schedulers.boundedElastic());
    }

    private ExecutionResponse runLocally(ExecutionRequest request) {
        String lang = request.getLanguage() != null ? request.getLanguage().toLowerCase() : "";

        if ("html".equals(lang) || "css".equals(lang)) {
            ExecutionResponse r = new ExecutionResponse();
            r.setIsError(false);
            r.setOutput(lang.toUpperCase() + " runs directly in the browser — no backend execution needed.");
            r.setError("");
            return r;
        }

        try {
            Path tempDir = Files.createTempDirectory("aicodementor_" + UUID.randomUUID());
            String stdin = request.getStdin();

            switch (lang) {
                case "python":     return runPython(request.getCode(), stdin, tempDir);
                case "javascript": return runJavaScript(request.getCode(), stdin, tempDir);
                case "java":       return runJava(request.getCode(), stdin, tempDir);
                case "cpp":        return runCpp(request.getCode(), stdin, tempDir);
                case "c":          return runC(request.getCode(), stdin, tempDir);
                default:           return error("Unsupported language: " + lang);
            }
        } catch (Exception e) {
            return error("Execution setup failed: " + e.getMessage());
        }
    }

    // ── Language runners ─────────────────────────────

    private ExecutionResponse runPython(String code, String stdin, Path dir) throws Exception {
        Files.writeString(dir.resolve("main.py"), code);
        Path script = dir.resolve("main.py");
        // Prefer Python 3: on Windows, `python` often points to 2.7 (no f-strings); `py -3` is the launcher.
        String[][] attempts = isWindows()
                ? new String[][]{{"py", "-3"}, {"python3"}, {"python"}}
                : new String[][]{{"python3"}, {"python"}};
        ExecutionResponse last = null;
        for (String[] prefix : attempts) {
            String[] cmd = new String[prefix.length + 1];
            System.arraycopy(prefix, 0, cmd, 0, prefix.length);
            cmd[prefix.length] = script.toString();
            ExecutionResponse r = exec(cmd, stdin, dir);
            if (!interpreterLaunchFailed(r)) {
                return r;
            }
            last = r;
        }
        return last != null ? last : error("Python 3 not found on PATH.");
    }

    /** True when the process failed because the executable was missing, not because user code failed. */
    private boolean interpreterLaunchFailed(ExecutionResponse r) {
        if (!r.getIsError()) {
            return false;
        }
        String e = (r.getError() != null ? r.getError() : "") + (r.getOutput() != null ? r.getOutput() : "");
        String lower = e.toLowerCase();
        return lower.contains("cannot find")
                || lower.contains("not recognized")
                || lower.contains("no such file")
                || lower.contains("error=2")
                || lower.contains("not found on path")
                || lower.contains("failed to start");
    }

    private ExecutionResponse runJavaScript(String code, String stdin, Path dir) throws Exception {
        Files.writeString(dir.resolve("main.js"), code);
        return exec(new String[]{"node", dir.resolve("main.js").toString()}, stdin, dir);
    }

    private ExecutionResponse runJava(String code, String stdin, Path dir) throws Exception {
        // Extract public class name or default to Main
        String className = "Main";
        for (String line : code.split("\n")) {
            line = line.trim();
            if (line.startsWith("public class ")) {
                className = line.split(" ")[2].replaceAll("[^a-zA-Z0-9_]", "");
                break;
            }
        }
        Files.writeString(dir.resolve(className + ".java"), code);
        ExecutionResponse compile = exec(new String[]{"javac", dir.resolve(className + ".java").toString()}, null, dir);
        if (compile.getIsError()) return compile;
        return exec(new String[]{"java", "-cp", dir.toString(), className}, stdin, dir);
    }

    private ExecutionResponse runCpp(String code, String stdin, Path dir) throws Exception {
        Path src = dir.resolve("main.cpp");
        Path out = dir.resolve(isWindows() ? "main.exe" : "main");
        Files.writeString(src, code);
        ExecutionResponse compile = exec(new String[]{"g++", src.toString(), "-o", out.toString()}, null, dir);
        if (compile.getIsError()) return compile;
        return exec(new String[]{out.toString()}, stdin, dir);
    }

    private ExecutionResponse runC(String code, String stdin, Path dir) throws Exception {
        Path src = dir.resolve("main.c");
        Path out = dir.resolve(isWindows() ? "main.exe" : "main");
        Files.writeString(src, code);
        ExecutionResponse compile = exec(new String[]{"gcc", src.toString(), "-o", out.toString()}, null, dir);
        if (compile.getIsError()) return compile;
        return exec(new String[]{out.toString()}, stdin, dir);
    }

    // ── Process executor ──────────────────────────────

    private ExecutionResponse exec(String[] cmd, String stdin, Path workDir) {
        try {
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.directory(workDir.toFile());

            Process proc = pb.start();

            // Write stdin
            try (OutputStream os = proc.getOutputStream()) {
                if (stdin != null && !stdin.isEmpty()) {
                    os.write(stdin.getBytes());
                }
            }

            String stdout = new String(proc.getInputStream().readAllBytes());
            String stderr  = new String(proc.getErrorStream().readAllBytes());

            boolean finished = proc.waitFor(15, TimeUnit.SECONDS);
            if (!finished) {
                proc.destroyForcibly();
                return error("Execution timed out after 15 seconds.");
            }

            int exitCode = proc.exitValue();
            ExecutionResponse r = new ExecutionResponse();
            r.setOutput(stdout);
            r.setError(stderr);
            r.setIsError(exitCode != 0);
            return r;

        } catch (IOException e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("cannot find") || msg.contains("No such file") || msg.contains("error=2")) {
                String tool = cmd[0];
                return error("'" + tool + "' not found on PATH. Please install " + runtimeName(tool) + " and ensure it is in your system PATH.");
            }
            return error("Process error: " + msg);
        } catch (Exception e) {
            return error("Execution error: " + e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────

    private boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }

    private String runtimeName(String tool) {
        switch (tool) {
            case "python":     case "python3": return "Python (https://python.org)";
            case "node":       return "Node.js (https://nodejs.org)";
            case "javac":      case "java":    return "JDK (https://adoptium.net)";
            case "g++":        return "GCC/G++ (https://mingw-w64.org)";
            case "gcc":        return "GCC (https://mingw-w64.org)";
            default:           return tool;
        }
    }

    private ExecutionResponse error(String msg) {
        ExecutionResponse r = new ExecutionResponse();
        r.setIsError(true);
        r.setError(msg);
        r.setOutput("");
        return r;
    }
}
