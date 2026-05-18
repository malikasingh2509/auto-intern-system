package com.example.backend.service;

import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIAnalysisService {

    @Autowired
    private UserProfileRepository userProfileRepository;

    public Map<String, Object> analyzeJobMatch(Long userId, Job job) {
        UserProfile user = userProfileRepository.findById(userId).orElse(null);
        Map<String, Object> analysis = new HashMap<>();

        if (user == null || job == null) {
            analysis.put("error", "User or Job not found");
            return analysis;
        }

        String userSkills = user.getSkills() != null ? user.getSkills().toLowerCase() : "";
        String resumeText = user.getResumeText() != null ? user.getResumeText().toLowerCase() : "";
        String combinedUserProfile = userSkills + " " + resumeText;

        String[] requiredSkills = job.getSkillsRequired() != null ? job.getSkillsRequired().toLowerCase().split(",") : new String[0];

        List<String> missingSkills = new ArrayList<>();
        List<String> matchedSkills = new ArrayList<>();

        for (String skill : requiredSkills) {
            String trimmedSkill = skill.trim();
            if (trimmedSkill.isEmpty()) continue;

            if (combinedUserProfile.contains(trimmedSkill)) {
                matchedSkills.add(trimmedSkill);
            } else {
                missingSkills.add(trimmedSkill);
            }
        }

        double score = 0;
        if (requiredSkills.length > 0) {
            score = ((double) matchedSkills.size() / requiredSkills.length) * 100.0;
        }

        List<String> improvementSuggestions = new ArrayList<>();
        if (!missingSkills.isEmpty()) {
            for (int i = 0; i < Math.min(3, missingSkills.size()); i++) {
                improvementSuggestions.add("Add a project demonstrating your " + missingSkills.get(i) + " skills.");
            }
            improvementSuggestions.add("Include more relevant keywords like " + String.join(", ", missingSkills) + " in your ATS summary.");
        } else {
            improvementSuggestions.add("Your resume is perfectly tailored for this job!");
            improvementSuggestions.add("Focus on soft skills in your cover letter.");
        }

        analysis.put("matchScore", Math.round(score));
        analysis.put("matchedSkills", matchedSkills);
        analysis.put("missingSkills", missingSkills);
        analysis.put("improvementSuggestions", improvementSuggestions);

        return analysis;
    }
}
