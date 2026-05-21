package com.example.backend.controller;

import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import com.example.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/chat")
public class AIChatController {

    @Autowired
    private UserProfileRepository userRepository;

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/{userId}")
    public Map<String, Object> chatWithAI(@PathVariable Long userId, @RequestBody ChatRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        UserProfile user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            response.put("success", false);
            response.put("message", "User profile not found.");
            return response;
        }

        // Build the system prompt injecting real profile details
        String systemPrompt = "You are a professional AI Career Coach and Resume Assistant. You help the user with resume reviews, cover letters, career path decisions, and interview preparation.\n" +
            "Here is the user's real profile information (do not use fake data, templates, or assumptions):\n" +
            "- Name: " + (user.getName() != null ? user.getName() : "N/A") + "\n" +
            "- Email: " + (user.getEmail() != null ? user.getEmail() : "N/A") + "\n" +
            "- Domain: " + (user.getDomain() != null ? user.getDomain() : "N/A") + "\n" +
            "- Experience: " + (user.getExperience() != null ? user.getExperience() : "N/A") + "\n" +
            "- Skills: " + (user.getSkills() != null ? user.getSkills() : "N/A") + "\n" +
            "- Preferred Roles: " + (user.getPreferredRoles() != null ? user.getPreferredRoles() : "N/A") + "\n" +
            "- Preferred Locations: " + (user.getPreferredLocations() != null ? user.getPreferredLocations() : "N/A") + "\n" +
            "- Employment Preference: " + (user.getJobTypePreference() != null ? user.getJobTypePreference() : "N/A") + "\n" +
            "- Salary Expectation: " + (user.getSalaryExpectations() != null ? user.getSalaryExpectations() : "N/A") + "\n\n";

        if (user.getResumeText() != null && !user.getResumeText().isBlank()) {
            systemPrompt += "Here is the parsed text from their uploaded Resume:\n" + user.getResumeText() + "\n\n";
        } else {
            systemPrompt += "The user has not uploaded a resume yet. Remind them to upload one in Profile settings for highly personalized ATS and cover letter suggestions.\n\n";
        }

        systemPrompt += "Provide premium, professional, actionable, and encouraging advice. " +
            "If they ask to write a CV or cover letter, write a beautifully formatted one using standard markdown structure tailored specifically to their profile details. " +
            "Ensure responses are direct, neat, and highly professional like LinkedIn or Internshala career coaching guidelines.\n\n";

        // Build prompt with conversation history
        StringBuilder promptBuilder = new StringBuilder(systemPrompt);
        promptBuilder.append("Conversation history:\n");
        if (request.getHistory() != null) {
            for (Map<String, String> chat : request.getHistory()) {
                String role = chat.get("sender");
                if (role == null) role = chat.get("role");
                String content = chat.get("text");
                if (content == null) content = chat.get("content");
                
                if (role != null && content != null) {
                    if ("user".equalsIgnoreCase(role)) {
                        promptBuilder.append("User: ").append(content).append("\n");
                    } else {
                        promptBuilder.append("AI: ").append(content).append("\n");
                    }
                }
            }
        }
        promptBuilder.append("User: ").append(request.getMessage()).append("\nAI: ");

        String reply = geminiService.generate(promptBuilder.toString());
        if (reply == null || reply.isBlank()) {
            response.put("success", false);
            response.put("reply", "⚠️ **AI is temporarily at capacity.**\n\nThe free-tier Gemini API quota has been reached for today. This resets every 24 hours.\n\n**In the meantime you can:**\n- Review your profile settings to improve job matching\n- Check the Matched Jobs page for new opportunities\n- Track your applications in the Application Tracker\n\nPlease try again later — the AI will be back shortly!");
        } else {
            response.put("success", true);
            response.put("reply", reply.trim());
        }

        return response;
    }

    public static class ChatRequest {
        private String message;
        private List<Map<String, String>> history;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public List<Map<String, String>> getHistory() { return history; }
        public void setHistory(List<Map<String, String>> history) { this.history = history; }
    }
}
