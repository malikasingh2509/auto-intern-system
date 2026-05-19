package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Email service using Brevo (Sendinblue) HTTP API.
 * Works on Render free tier — no SMTP ports needed, uses HTTPS only.
 *
 * Free tier: 300 emails/day — https://app.brevo.com
 */
@Service
public class EmailService {

    @Value("${brevo.api.key:PLACEHOLDER}")
    private String brevoApiKey;

    @Value("${brevo.from.email:malikawork2509@gmail.com}")
    private String fromEmail;

    @Value("${brevo.from.name:Auto-Intern}")
    private String fromName;

    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    // Async — fire-and-forget (welcome / login notifications)
    public void sendEmail(String to, String subject, String text) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                sendSync(to, subject, text);
            } catch (Exception e) {
                System.err.println("[EmailService] ASYNC send failed to " + to + ": " + e.getMessage());
            }
        });
    }

    // Synchronous — throws so caller can surface the error (OTP flow)
    public void sendEmailSync(String to, String subject, String text) throws Exception {
        sendSync(to, subject, text);
    }

    private void sendSync(String to, String subject, String text) throws Exception {
        if ("PLACEHOLDER".equals(brevoApiKey)) {
            throw new Exception("BREVO_API_KEY environment variable is not set on Render.");
        }

        // Build JSON payload for Brevo API
        String toName = to.split("@")[0];
        // Escape text for JSON
        String safeText = text
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r");
        String safeSubject = subject.replace("\"", "\\\"");
        String safeToName  = toName.replace("\"", "\\\"");
        String safeFrom    = fromEmail.replace("\"", "\\\"");
        String safeFromName = fromName.replace("\"", "\\\"");

        String jsonBody = "{"
            + "\"sender\":{\"name\":\"" + safeFromName + "\",\"email\":\"" + safeFrom + "\"},"
            + "\"to\":[{\"email\":\"" + to + "\",\"name\":\"" + safeToName + "\"}],"
            + "\"subject\":\"" + safeSubject + "\","
            + "\"textContent\":\"" + safeText + "\""
            + "}";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BREVO_URL))
            .header("accept", "application/json")
            .header("api-key", brevoApiKey)
            .header("content-type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        int statusCode = response.statusCode();
        System.out.println("[EmailService] Brevo response " + statusCode + " to " + to + ": " + response.body());

        if (statusCode < 200 || statusCode >= 300) {
            throw new Exception("Brevo API returned HTTP " + statusCode + ": " + response.body());
        }

        System.out.println("[EmailService] Email sent successfully to " + to);
    }
}
