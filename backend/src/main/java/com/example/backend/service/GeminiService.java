package com.example.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.logging.Logger;

/**
 * Reusable Gemini API client.
 *
 * Uses gemini-1.5-flash for speed + free-tier compatibility.
 * All AI features (ATS scoring, CV generation, suggestions) use this.
 *
 * Set environment variable GEMINI_API_KEY in Render dashboard.
 */
@Service
public class GeminiService {

    private static final Logger log = Logger.getLogger(GeminiService.class.getName());

    @Value("${gemini.api.key:NOT_SET}")
    private String apiKey;

    private static final String MODEL      = "gemini-2.5-flash";
    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent";

    private final HttpClient http = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(15))
        .build();

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Send a plain-text prompt to Gemini, get a plain-text response back.
     *
     * @param prompt  The full prompt string
     * @return        Gemini's text response, or null on failure
     */
    public String generate(String prompt) {
        if ("NOT_SET".equals(apiKey) || apiKey == null || apiKey.isBlank()) {
            log.warning("[GEMINI] API key not configured — set GEMINI_API_KEY env variable in Render.");
            return null;
        }

        try {
            String url  = GEMINI_URL + "?key=" + apiKey;
            String body = buildRequestBody(prompt);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(30))
                .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warning("[GEMINI] Non-200 response: " + response.statusCode() + " — " + response.body().substring(0, Math.min(200, response.body().length())));
                return null;
            }

            return extractText(response.body());

        } catch (Exception e) {
            log.severe("[GEMINI] Request failed: " + e.getMessage());
            return null;
        }
    }

    private String buildRequestBody(String prompt) throws Exception {
        // Gemini REST API request format
        return mapper.writeValueAsString(mapper.createObjectNode()
            .set("contents", mapper.createArrayNode()
                .add(mapper.createObjectNode()
                    .set("parts", mapper.createArrayNode()
                        .add(mapper.createObjectNode()
                            .put("text", prompt))))));
    }

    private String extractText(String responseBody) {
        try {
            JsonNode root = mapper.readTree(responseBody);
            return root
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text")
                .asText(null);
        } catch (Exception e) {
            log.warning("[GEMINI] Failed to parse response: " + e.getMessage());
            return null;
        }
    }
}
