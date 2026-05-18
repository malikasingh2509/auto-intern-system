package com.example.backend.service;

import com.example.backend.model.ResumeAnalysis;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.ResumeAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ATSScoringService {

    @Autowired
    private ResumeAnalysisRepository resumeAnalysisRepository;

    public ResumeAnalysis generateAnalysis(UserProfile user) {
        String resumeText = user.getResumeText() != null ? user.getResumeText().toLowerCase() : "";
        String userSkills = user.getSkills() != null ? user.getSkills().toLowerCase() : "";
        String combinedText = resumeText + " " + userSkills;

        // Basic Heuristics
        int keywordScore = 0;
        int projectRelevanceScore = 0;
        int experienceScore = 0;

        List<String> detectedSkills = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();
        List<String> weakSections = new ArrayList<>();
        List<String> improvementChecklist = new ArrayList<>();

        // 1. Keyword Score
        String[] popularTech = {"java", "python", "react", "spring", "docker", "aws", "mysql", "javascript", "typescript", "git", "linux", "cloud", "api", "rest"};
        int matchedKeywords = 0;
        for (String tech : popularTech) {
            if (combinedText.contains(tech)) {
                detectedSkills.add(tech.substring(0, 1).toUpperCase() + tech.substring(1));
                matchedKeywords++;
            } else {
                missingKeywords.add(tech.substring(0, 1).toUpperCase() + tech.substring(1));
            }
        }
        keywordScore = Math.min((int) (((double) matchedKeywords / popularTech.length) * 100), 100);

        // 2. Project Relevance
        if (resumeText.contains("project") || resumeText.contains("github")) {
            projectRelevanceScore = 85;
            improvementChecklist.add("Great job including a projects section.");
        } else {
            projectRelevanceScore = 30;
            weakSections.add("Projects Portfolio");
            improvementChecklist.add("Add links to live projects or GitHub repositories.");
        }

        // 3. Experience Score
        if (resumeText.contains("experience") || resumeText.contains("internship") || resumeText.contains("work")) {
            experienceScore = 90;
            improvementChecklist.add("Ensure bullet points use strong action verbs.");
        } else {
            experienceScore = 40;
            weakSections.add("Professional Experience");
            improvementChecklist.add("Elaborate on any internships or freelance work.");
        }

        // 4. Overall structural checks
        if (resumeText.length() < 500) {
            weakSections.add("Resume Length");
            improvementChecklist.add("Your resume is too short. Add more detailed descriptions.");
        }
        if (!resumeText.contains("education") && !resumeText.contains("university")) {
            weakSections.add("Education");
            improvementChecklist.add("Explicitly list your educational background.");
        }

        int overallScore = (int) (keywordScore * 0.4 + projectRelevanceScore * 0.3 + experienceScore * 0.3);

        // Save or update existing analysis
        Optional<ResumeAnalysis> existing = resumeAnalysisRepository.findByUserProfile(user);
        ResumeAnalysis analysis = existing.orElseGet(ResumeAnalysis::new);

        analysis.setUserProfile(user);
        analysis.setOverallScore(overallScore);
        analysis.setKeywordScore(keywordScore);
        analysis.setProjectRelevanceScore(projectRelevanceScore);
        analysis.setExperienceScore(experienceScore);
        analysis.setDetectedSkills(String.join(",", detectedSkills));
        
        // Take top 5 missing keywords
        List<String> topMissing = missingKeywords.subList(0, Math.min(5, missingKeywords.size()));
        analysis.setMissingKeywords(String.join(",", topMissing));
        
        analysis.setWeakSections(String.join("|", weakSections));
        analysis.setImprovementChecklist(String.join("|", improvementChecklist));

        return resumeAnalysisRepository.save(analysis);
    }
}
