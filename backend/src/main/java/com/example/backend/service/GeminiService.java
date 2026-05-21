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
 * Reusable Gemini API client with multi-model fallback.
 *
 * Tries models in order until one succeeds. Handles 429 quota errors
 * gracefully by falling through to the next model.
 */
@Service
public class GeminiService {

    private static final Logger log = Logger.getLogger(GeminiService.class.getName());

    @Value("${gemini.api.key}")
    private String apiKey;

    // Try models in order — each has different quota pools on free tier
    private static final String[] MODELS = {
        "gemini-2.0-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest"
    };

    private static final String BASE_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/";

    private final HttpClient http = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(15))
        .build();

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Send a plain-text prompt to Gemini.
     * Tries multiple models until one succeeds.
     * Returns null only if ALL models fail.
     */
    public String generate(String prompt) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("NOT_SET")) {
            log.warning("[GEMINI] API key is not configured.");
            return null;
        }

        for (String model : MODELS) {
            String result = tryModel(model, prompt);
            if (result != null) {
                log.info("[GEMINI] Success with model: " + model);
                return result;
            }
        }

        log.severe("[GEMINI] All models failed or quota exhausted.");
        return null;
    }

    private String tryModel(String model, String prompt) {
        try {
            String url  = BASE_URL + model + ":generateContent?key=" + apiKey;
            String body = buildRequestBody(prompt);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(30))
                .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return extractText(response.body());
            }

            if (response.statusCode() == 429) {
                log.warning("[GEMINI] " + model + " quota exhausted (429), trying next model...");
                return null; // Fall through to next model
            }

            if (response.statusCode() == 404) {
                log.warning("[GEMINI] " + model + " not available (404), trying next model...");
                return null;
            }

            log.warning("[GEMINI] " + model + " returned HTTP " + response.statusCode());
            return null;

        } catch (Exception e) {
            log.warning("[GEMINI] " + model + " request failed: " + e.getMessage());
            return null;
        }
    }

    private String buildRequestBody(String prompt) throws Exception {
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
