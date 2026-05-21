package com.example.backend.service;

import com.example.backend.model.ResumeAnalysis;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.ResumeAnalysisRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

/**
 * ATS Scoring Service — powered by Gemini 1.5 Flash.
 *
 * Replaces old hardcoded 14-keyword heuristic with a real LLM analysis.
 * Falls back to heuristic-only if Gemini API key is not set.
 */
@Service
public class ATSScoringService {

    private static final Logger log = Logger.getLogger(ATSScoringService.class.getName());

    @Autowired private ResumeAnalysisRepository resumeAnalysisRepository;
    @Autowired private GeminiService geminiService;

    private final ObjectMapper mapper = new ObjectMapper();

    public ResumeAnalysis generateAnalysis(UserProfile user) {
        String resumeText = user.getResumeText() != null ? user.getResumeText() : "";
        String userSkills = user.getSkills()     != null ? user.getSkills()     : "";
        String roles      = user.getDomain()     != null ? user.getDomain()     : "software development";

        log.info("[ATS] Generating Gemini-powered ATS analysis for user " + user.getId());

        // ── Try Gemini first ─────────────────────────────────────────────────
        String geminiResponse = callGemini(resumeText, userSkills, roles);

        ResumeAnalysis analysis = parseGeminiResponse(geminiResponse, user, resumeText, userSkills);

        // ── Save or update ────────────────────────────────────────────────────
        Optional<ResumeAnalysis> existing = resumeAnalysisRepository.findByUserProfile(user);
        ResumeAnalysis saved = existing.orElse(analysis);

        saved.setUserProfile(user);
        saved.setOverallScore(analysis.getOverallScore());
        saved.setKeywordScore(analysis.getKeywordScore());
        saved.setProjectRelevanceScore(analysis.getProjectRelevanceScore());
        saved.setExperienceScore(analysis.getExperienceScore());
        saved.setDetectedSkills(analysis.getDetectedSkills());
        saved.setMissingKeywords(analysis.getMissingKeywords());
        saved.setWeakSections(analysis.getWeakSections());
        saved.setImprovementChecklist(analysis.getImprovementChecklist());

        return resumeAnalysisRepository.save(saved);
    }

    private String callGemini(String resumeText, String skills, String roles) {
        String prompt = """
            You are an expert ATS (Applicant Tracking System) resume analyzer.

            Analyze the following resume for someone targeting roles in: %s

            RESUME TEXT:
            ---
            %s
            ---

            SELF-REPORTED SKILLS: %s

            Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
            {
              "overallScore": <0-100 integer>,
              "keywordScore": <0-100 integer>,
              "projectScore": <0-100 integer>,
              "experienceScore": <0-100 integer>,
              "detectedSkills": ["skill1", "skill2"],
              "missingKeywords": ["keyword1", "keyword2", "keyword3"],
              "weakSections": ["Section Name 1", "Section Name 2"],
              "improvementChecklist": [
                "Specific actionable suggestion 1",
                "Specific actionable suggestion 2",
                "Specific actionable suggestion 3"
              ]
            }

            Be specific and accurate. Base the score on actual resume content quality, not just keyword presence.
            """.formatted(roles, resumeText.length() > 4000 ? resumeText.substring(0, 4000) : resumeText, skills);

        return geminiService.generate(prompt);
    }

    private ResumeAnalysis parseGeminiResponse(String geminiJson, UserProfile user, String resumeText, String userSkills) {
        ResumeAnalysis analysis = new ResumeAnalysis();

        if (geminiJson != null && !geminiJson.isBlank()) {
            try {
                // Strip markdown code fences if present
                String cleaned = geminiJson.trim();
                if (cleaned.startsWith("```")) {
                    cleaned = cleaned.replaceAll("```[a-z]*\\n?", "").replace("```", "").trim();
                }

                JsonNode json = mapper.readTree(cleaned);

                analysis.setOverallScore(json.path("overallScore").asInt(50));
                analysis.setKeywordScore(json.path("keywordScore").asInt(50));
                analysis.setProjectRelevanceScore(json.path("projectScore").asInt(50));
                analysis.setExperienceScore(json.path("experienceScore").asInt(50));

                analysis.setDetectedSkills(  jsonArrayToString(json.path("detectedSkills"),   ","));
                analysis.setMissingKeywords(  jsonArrayToString(json.path("missingKeywords"),  ","));
                analysis.setWeakSections(     jsonArrayToString(json.path("weakSections"),     "|"));
                analysis.setImprovementChecklist(jsonArrayToString(json.path("improvementChecklist"), "|"));

                log.info("[ATS] Gemini analysis parsed — overall score: " + analysis.getOverallScore());
                return analysis;

            } catch (Exception e) {
                log.warning("[ATS] Failed to parse Gemini JSON response, falling back to heuristic: " + e.getMessage());
            }
        }

        // ── Fallback heuristic if Gemini unavailable ──────────────────────────
        log.info("[ATS] Using heuristic fallback (Gemini not available)");
        return heuristicFallback(analysis, resumeText, userSkills);
    }

    private ResumeAnalysis heuristicFallback(ResumeAnalysis analysis, String resumeText, String userSkills) {
        String combined = (resumeText + " " + userSkills).toLowerCase();
        String[] tech = {"java","python","react","spring","docker","aws","mysql","javascript","typescript","git","node","linux","api","rest"};

        List<String> detected = new ArrayList<>();
        List<String> missing  = new ArrayList<>();
        for (String t : tech) {
            if (combined.contains(t)) detected.add(capitalize(t));
            else missing.add(capitalize(t));
        }

        int kw  = (int)((double) detected.size() / tech.length * 100);
        int prj = resumeText.toLowerCase().contains("project") ? 75 : 30;
        int exp = resumeText.toLowerCase().contains("experience") ? 80 : 40;
        int overall = (int)(kw * 0.4 + prj * 0.3 + exp * 0.3);

        analysis.setOverallScore(overall);
        analysis.setKeywordScore(kw);
        analysis.setProjectRelevanceScore(prj);
        analysis.setExperienceScore(exp);
        analysis.setDetectedSkills(String.join(",", detected));
        analysis.setMissingKeywords(String.join(",", missing.subList(0, Math.min(5, missing.size()))));
        analysis.setWeakSections(prj < 50 ? "Projects Portfolio" : "");
        analysis.setImprovementChecklist("Add more technical keywords|Include GitHub project links|Quantify your achievements");
        return analysis;
    }

    private String jsonArrayToString(JsonNode arr, String separator) {
        if (arr == null || arr.isMissingNode() || !arr.isArray()) return "";
        List<String> items = new ArrayList<>();
        arr.forEach(n -> items.add(n.asText()));
        return String.join(separator, items);
    }

    private String capitalize(String s) {
        return s.isEmpty() ? s : s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
