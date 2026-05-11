package com.aicodementor;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		loadDotEnvIntoSystemProperties();
		SpringApplication.run(BackendApplication.class, args);
	}

	/**
	 * Loads {@code .env} from the backend working directory or project root so
	 * {@code GEMINI_API_KEY} works with {@code mvn spring-boot:run}, matching Docker Compose.
	 */
	private static void loadDotEnvIntoSystemProperties() {
		Path cwd = Path.of("").toAbsolutePath();
		Path[] dirs = { cwd, cwd.getParent() };
		for (Path dir : dirs) {
			if (dir == null) {
				continue;
			}
			Path envFile = dir.resolve(".env");
			if (!Files.isRegularFile(envFile)) {
				continue;
			}
			Dotenv dotenv = Dotenv.configure()
					.directory(dir.toString())
					.ignoreIfMalformed()
					.load();
			dotenv.entries().forEach(e -> {
				String key = e.getKey();
				if (System.getenv(key) == null && System.getProperty(key) == null) {
					System.setProperty(key, e.getValue());
				}
			});
			return;
		}
	}

}
