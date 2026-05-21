package com.example.backend.service;

import com.example.backend.model.GeneratedResume;
import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.GeneratedResumeRepository;
import com.example.backend.repository.UserProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

/**
 * CV Generator powered by Gemini 1.5 Flash.
 *
 * Replaces all hardcoded template strings ("40% performance gains" etc.)
 * with real Gemini-generated tailored resume content and cover letters.
 * Every piece of output is based on the user's actual resume and the real job.
 */
@Service
public class CVGeneratorService {

    private static final Logger log = Logger.getLogger(CVGeneratorService.class.getName());

    @Autowired private GeneratedResumeRepository generatedResumeRepository;
    @Autowired private UserProfileRepository     userProfileRepository;
    @Autowired private GeminiService             geminiService;

    private final ObjectMapper mapper = new ObjectMapper();

    public GeneratedResume generateTailoredCV(Long userId, Job job) {
        UserProfile user = userProfileRepository.findById(userId).orElse(null);
        if (user == null || job == null) return null;

        String resumeText = user.getResumeText() != null ? user.getResumeText() : "";
        String skills     = user.getSkills()     != null ? user.getSkills()     : "";
        String name       = user.getName()        != null ? user.getName()       : "Candidate";
        String experience = user.getExperience()  != null ? user.getExperience() : "";

        String jobTitle   = job.getTitle()          != null ? job.getTitle()         : "Role";
        String company    = job.getCompany()         != null ? job.getCompany()       : "Company";
        String jobSkills  = job.getSkillsRequired()  != null ? job.getSkillsRequired(): "";
        String jobDesc    = job.getDescription()     != null ? job.getDescription()   : "";

        log.info("[CV GEN] Generating Gemini-powered CV for " + name + " → " + jobTitle + " at " + company);

        // ── Call Gemini for tailored content ─────────────────────────────────
        String prompt = buildCVPrompt(name, resumeText, skills, experience, jobTitle, company, jobSkills, jobDesc);
        String geminiResponse = geminiService.generate(prompt);

        // ── Parse Gemini output ───────────────────────────────────────────────
        String tailoredContent;
        String coverLetter;
        String addedKeywords;
        int originalScore;
        int optimizedScore;

        if (geminiResponse != null) {
            ParsedCV parsed = parseCVResponse(geminiResponse, resumeText, jobSkills);
            tailoredContent  = parsed.tailoredContent;
            coverLetter      = parsed.coverLetter;
            addedKeywords    = parsed.addedKeywords;
            originalScore    = parsed.originalScore;
            optimizedScore   = parsed.optimizedScore;
        } else {
            // Fallback: still uses real user data, just structured templates
            log.warning("[CV GEN] Gemini unavailable — using data-driven fallback");
            tailoredContent = buildFallbackContent(name, skills, jobTitle, company, jobSkills, experience);
            coverLetter     = buildFallbackCoverLetter(name, skills, jobTitle, company, jobSkills);
            addedKeywords   = computeMissingKeywords(resumeText, jobSkills);
            originalScore   = computeOriginalScore(resumeText, jobSkills);
            optimizedScore  = Math.min(originalScore + 15, 95);
        }

        // ── Persist ───────────────────────────────────────────────────────────
        GeneratedResume resume = new GeneratedResume();
        resume.setUser(user);
        resume.setTargetJobTitle(jobTitle);
        resume.setTargetCompany(company);
        resume.setTailoredContent(tailoredContent);
        resume.setCoverLetterContent(coverLetter);
        resume.setOriginalAtsScore(originalScore);
        resume.setOptimizedAtsScore(optimizedScore);
        resume.setAddedKeywords(addedKeywords);
        resume.setReorderedSections("Gemini AI optimized sections for ATS compatibility.");
        resume.setGeneratedDate(LocalDateTime.now());

        return generatedResumeRepository.save(resume);
    }

    private String buildCVPrompt(String name, String resumeText, String skills, String experience,
                                  String jobTitle, String company, String jobSkills, String jobDesc) {
        return """
            You are a professional resume writer and career coach.

            Generate a tailored job application package for:
            NAME: %s
            TARGET JOB: %s at %s
            REQUIRED SKILLS: %s
            JOB DESCRIPTION: %s

            CANDIDATE'S CURRENT RESUME:
            ---
            %s
            ---
            CURRENT SKILLS: %s
            EXPERIENCE: %s years

            Create a tailored application package. Respond ONLY with valid JSON (no markdown):
            {
              "professionalSummary": "<2-3 sentence tailored summary based on their ACTUAL experience>",
              "highlightedExperience": "<bullet points from their REAL experience, reframed for this role>",
              "coreCompetencies": "<skills list including both existing + relevant additions>",
              "coverLetter": "<full professional cover letter using their real background>",
              "addedKeywords": "<comma-separated keywords added for ATS>",
              "originalAtsScore": <0-100 estimate of current resume vs this job>,
              "optimizedAtsScore": <0-100 estimate after optimization>
            }

            IMPORTANT:
            - Use only the candidate's REAL experience from the resume above
            - Do NOT invent metrics, companies, or achievements
            - The cover letter must sound like it was written by this specific person
            - Highlight skills they ACTUALLY have that match this role
            """.formatted(
                name, jobTitle, company,
                jobSkills,
                jobDesc.length() > 800 ? jobDesc.substring(0, 800) : jobDesc,
                resumeText.length() > 3000 ? resumeText.substring(0, 3000) : resumeText,
                skills,
                experience.isEmpty() ? "fresher" : experience
            );
    }

    private ParsedCV parseCVResponse(String geminiJson, String resumeText, String jobSkills) {
        ParsedCV result = new ParsedCV();
        try {
            String cleaned = geminiJson.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```[a-z]*\\n?", "").replace("```", "").trim();
            }

            JsonNode json = mapper.readTree(cleaned);

            String summary    = json.path("professionalSummary").asText("");
            String expSection = json.path("highlightedExperience").asText("");
            String competencies = json.path("coreCompetencies").asText("");

            result.tailoredContent = "## PROFESSIONAL SUMMARY\n" + summary +
                "\n\n## HIGHLIGHTED EXPERIENCE\n" + expSection +
                "\n\n## CORE COMPETENCIES\n" + competencies;

            result.coverLetter    = json.path("coverLetter").asText("");
            result.addedKeywords  = json.path("addedKeywords").asText("");
            result.originalScore  = json.path("originalAtsScore").asInt(computeOriginalScore(resumeText, jobSkills));
            result.optimizedScore = json.path("optimizedAtsScore").asInt(Math.min(result.originalScore + 15, 95));

        } catch (Exception e) {
            log.warning("[CV GEN] Failed to parse Gemini CV response: " + e.getMessage());
            result.tailoredContent = geminiJson; // Return raw text as fallback
            result.coverLetter     = "";
            result.addedKeywords   = computeMissingKeywords(resumeText, jobSkills);
            result.originalScore   = computeOriginalScore(resumeText, jobSkills);
            result.optimizedScore  = Math.min(result.originalScore + 15, 95);
        }
        return result;
    }

    // ── Fallback builders (uses real user data, no fake metrics) ─────────────

    private String buildFallbackContent(String name, String skills, String jobTitle, String company, String jobSkills, String exp) {
        String summary = "Results-oriented professional targeting the " + jobTitle + " role at " + company +
            ". Brings hands-on experience in " + skills + " and is eager to contribute to impactful projects.";

        String experience = "- Applied " + skills + " in real-world projects aligned with " + jobTitle + " responsibilities.\n";
        if (!exp.isEmpty() && !exp.equals("0")) {
            experience += "- " + exp + " years of practical development experience.\n";
        }

        return "## PROFESSIONAL SUMMARY\n" + summary +
            "\n\n## HIGHLIGHTED EXPERIENCE\n" + experience +
            "\n\n## CORE COMPETENCIES\n" + skills + (jobSkills.isEmpty() ? "" : ", " + jobSkills);
    }

    private String buildFallbackCoverLetter(String name, String skills, String jobTitle, String company, String jobSkills) {
        return "Dear Hiring Manager at " + company + ",\n\n" +
            "I am writing to express my strong interest in the " + jobTitle + " position. " +
            "With my background in " + skills + ", I am confident in contributing meaningfully to your team.\n\n" +
            "I am particularly excited about this role because it aligns with my experience and goals. " +
            "I look forward to the opportunity to discuss how my skills can support " + company + "'s mission.\n\n" +
            "Thank you for your consideration.\n\nSincerely,\n" + name;
    }

    private String computeMissingKeywords(String resumeText, String jobSkills) {
        if (jobSkills.isEmpty()) return "";
        String lower = resumeText.toLowerCase();
        List<String> missing = new ArrayList<>();
        for (String s : jobSkills.split(",")) {
            String t = s.trim().toLowerCase();
            if (!t.isEmpty() && !lower.contains(t)) missing.add(t);
        }
        return String.join(", ", missing);
    }

    private int computeOriginalScore(String resumeText, String jobSkills) {
        if (jobSkills.isEmpty()) return 50;
        String lower = resumeText.toLowerCase();
        String[] required = jobSkills.split(",");
        int matched = 0;
        for (String s : required) {
            if (lower.contains(s.trim().toLowerCase())) matched++;
        }
        return required.length > 0 ? (int)((double) matched / required.length * 100) : 50;
    }

    private static class ParsedCV {
        String tailoredContent = "";
        String coverLetter     = "";
        String addedKeywords   = "";
        int    originalScore   = 50;
        int    optimizedScore  = 65;
    }
}
