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
 * AI client with multi-provider fallback:
 * 1. Gemini (Google) — tries multiple models
 * 2. Groq (free, no daily limits, very fast) — used as fallback
 *
 * This prevents AI chatbot downtime when Gemini free-tier quota is exhausted.
 */
@Service
public class GeminiService {

    private static final Logger log = Logger.getLogger(GeminiService.class.getName());

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${groq.api.key:NOT_SET}")
    private String groqApiKey;

    // Gemini models — tried in order, each has separate quota pool
    private static final String[] GEMINI_MODELS = {
        "gemini-2.0-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-flash-latest"
    };

    private static final String GEMINI_BASE =
        "https://generativelanguage.googleapis.com/v1beta/models/";

    // Groq API — free tier, no daily quota limit
    private static final String GROQ_URL =
        "https://api.groq.com/openai/v1/chat/completions";
    private static final String GROQ_MODEL = "llama-3.3-70b-versatile";

    private final HttpClient http = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(15))
        .build();

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Generate a response from any available AI.
     * Tries Gemini first (all models), then falls back to Groq.
     */
    public String generate(String prompt) {
        // 1. Try all Gemini models
        if (geminiApiKey != null && !geminiApiKey.isBlank() && !geminiApiKey.equals("NOT_SET")) {
            for (String model : GEMINI_MODELS) {
                String result = tryGemini(model, prompt);
                if (result != null) {
                    log.info("[AI] Gemini success with model: " + model);
                    return result;
                }
            }
            log.warning("[AI] All Gemini models quota exhausted, trying Groq fallback...");
        }

        // 2. Fallback to Groq
        if (!groqApiKey.equals("NOT_SET") && !groqApiKey.isBlank()) {
            String result = tryGroq(prompt);
            if (result != null) {
                log.info("[AI] Groq fallback success.");
                return result;
            }
        }

        log.severe("[AI] All AI providers failed.");
        return null;
    }

    private String tryGemini(String model, String prompt) {
        try {
            String url  = GEMINI_BASE + model + ":generateContent?key=" + geminiApiKey;
            String body = mapper.writeValueAsString(mapper.createObjectNode()
                .set("contents", mapper.createArrayNode()
                    .add(mapper.createObjectNode()
                        .set("parts", mapper.createArrayNode()
                            .add(mapper.createObjectNode().put("text", prompt))))));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(30))
                .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = mapper.readTree(response.body());
                return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText(null);
            }
            // 429 = quota, 404 = model unavailable, 403 = project restriction
            log.warning("[AI] Gemini " + model + " HTTP " + response.statusCode());
            return null;

        } catch (Exception e) {
            log.warning("[AI] Gemini " + model + " error: " + e.getMessage());
            return null;
        }
    }

    private String tryGroq(String prompt) {
        try {
            // Groq uses OpenAI-compatible chat completions format
            String body = mapper.writeValueAsString(mapper.createObjectNode()
                .put("model", GROQ_MODEL)
                .put("temperature", 0.7)
                .put("max_tokens", 2048)
                .set("messages", mapper.createArrayNode()
                    .add(mapper.createObjectNode()
                        .put("role", "user")
                        .put("content", prompt))));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GROQ_URL))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(30))
                .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = mapper.readTree(response.body());
                return root.path("choices").get(0)
                    .path("message").path("content").asText(null);
            }
            log.warning("[AI] Groq returned HTTP " + response.statusCode() + ": " + response.body().substring(0, Math.min(200, response.body().length())));
            return null;

        } catch (Exception e) {
            log.warning("[AI] Groq error: " + e.getMessage());
            return null;
        }
    }
}
