package com.example.backend.service;

import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Per-job AI analysis powered by Gemini 1.5 Flash.
 *
 * Replaces the old String.contains() skill matcher with a real LLM
 * that reads the full resume and full job description.
 */
@Service
public class AIAnalysisService {

    private static final Logger log = Logger.getLogger(AIAnalysisService.class.getName());

    @Autowired private UserProfileRepository userProfileRepository;
    @Autowired private GeminiService         geminiService;

    private final ObjectMapper mapper = new ObjectMapper();

    public Map<String, Object> analyzeJobMatch(Long userId, Job job) {
        UserProfile user = userProfileRepository.findById(userId).orElse(null);
        Map<String, Object> result = new HashMap<>();

        if (user == null || job == null) {
            result.put("error", "User or Job not found");
            return result;
        }

        String resumeText  = user.getResumeText() != null ? user.getResumeText() : "";
        String userSkills  = user.getSkills()     != null ? user.getSkills()     : "";
        String jobTitle    = job.getTitle()        != null ? job.getTitle()       : "Unknown Role";
        String jobCompany  = job.getCompany()      != null ? job.getCompany()     : "Unknown Company";
        String jobSkills   = job.getSkillsRequired() != null ? job.getSkillsRequired() : "";
        String jobDesc     = job.getDescription()  != null ? job.getDescription() : "";

        log.info("[AI ANALYSIS] Analyzing job '" + jobTitle + "' at '" + jobCompany + "' for user " + userId);

        // ── Try Gemini ───────────────────────────────────────────────────────
        String geminiResponse = callGemini(resumeText, userSkills, jobTitle, jobCompany, jobSkills, jobDesc);

        if (geminiResponse != null) {
            Map<String, Object> parsed = parseGeminiResponse(geminiResponse);
            if (parsed != null) {
                log.info("[AI ANALYSIS] Gemini match score: " + parsed.get("matchScore"));
                return parsed;
            }
        }

        // ── Fallback: string-match heuristic ─────────────────────────────────
        log.info("[AI ANALYSIS] Falling back to heuristic match");
        return heuristicFallback(resumeText, userSkills, jobSkills);
    }

    private String callGemini(String resumeText, String skills, String jobTitle, String company, String jobSkills, String jobDesc) {
        String prompt = """
            You are an expert ATS career coach analyzing resume-job compatibility.

            JOB: %s at %s
            REQUIRED SKILLS: %s
            JOB DESCRIPTION: %s

            CANDIDATE RESUME:
            ---
            %s
            ---
            SELF-REPORTED SKILLS: %s

            Analyze the match between this candidate's resume and the job.
            Respond ONLY with valid JSON (no markdown, no extra text):
            {
              "matchScore": <0-100 integer — real ATS compatibility score>,
              "matchedSkills": ["skill1", "skill2"],
              "missingSkills": ["skill1", "skill2"],
              "improvementSuggestions": [
                "Specific suggestion 1 based on this exact job",
                "Specific suggestion 2",
                "Specific suggestion 3"
              ]
            }

            Be precise. Base the score on actual resume content vs job requirements.
            """.formatted(
                jobTitle, company,
                jobSkills,
                jobDesc.length() > 1000 ? jobDesc.substring(0, 1000) : jobDesc,
                resumeText.length() > 3000 ? resumeText.substring(0, 3000) : resumeText,
                skills
            );

        return geminiService.generate(prompt);
    }

    private Map<String, Object> parseGeminiResponse(String geminiJson) {
        try {
            String cleaned = geminiJson.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```[a-z]*\\n?", "").replace("```", "").trim();
            }

            JsonNode json = mapper.readTree(cleaned);

            Map<String, Object> result = new HashMap<>();
            result.put("matchScore",   json.path("matchScore").asLong(0));
            result.put("matchedSkills", toList(json.path("matchedSkills")));
            result.put("missingSkills", toList(json.path("missingSkills")));
            result.put("improvementSuggestions", toList(json.path("improvementSuggestions")));
            return result;

        } catch (Exception e) {
            log.warning("[AI ANALYSIS] Failed to parse Gemini response: " + e.getMessage());
            return null;
        }
    }

    private Map<String, Object> heuristicFallback(String resumeText, String userSkills, String jobSkills) {
        String combined = (resumeText + " " + userSkills).toLowerCase();
        String[] required = jobSkills.isEmpty() ? new String[0] : jobSkills.toLowerCase().split("[,;]");

        List<String> matched = new ArrayList<>();
        List<String> missing  = new ArrayList<>();
        for (String s : required) {
            String t = s.trim();
            if (t.isEmpty()) continue;
            if (combined.contains(t)) matched.add(t);
            else missing.add(t);
        }

        double score = required.length > 0 ? ((double) matched.size() / required.length) * 100 : 30;

        List<String> suggestions = new ArrayList<>();
        for (int i = 0; i < Math.min(3, missing.size()); i++) {
            suggestions.add("Add a project or experience demonstrating " + missing.get(i) + ".");
        }
        if (missing.size() > 3) {
            suggestions.add("Include keywords: " + String.join(", ", missing) + " in your resume summary.");
        }
        if (suggestions.isEmpty()) {
            suggestions.add("Your resume matches well. Focus on quantifying your achievements.");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("matchScore", Math.round(score));
        result.put("matchedSkills", matched);
        result.put("missingSkills", missing);
        result.put("improvementSuggestions", suggestions);
        return result;
    }

    private List<String> toList(JsonNode arr) {
        List<String> list = new ArrayList<>();
        if (arr != null && arr.isArray()) arr.forEach(n -> list.add(n.asText()));
        return list;
    }
}
