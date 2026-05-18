package com.example.backend.controller;

import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.backend.model.ResumeAnalysis;
import com.example.backend.service.ATSScoringService;
import org.springframework.http.ResponseEntity;

@RestController
@CrossOrigin(origins = "*")
public class ResumeAnalysisController {

    @Autowired
    private UserProfileRepository repository;

    @Autowired
    private ATSScoringService atsScoringService;

    @GetMapping("/analyze-resume/{id}")
    public ResponseEntity<?> analyzeResume(@PathVariable Long id) {
        try {
            UserProfile user = repository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }
            if (user.getResumeText() == null || user.getResumeText().trim().isEmpty()) {
                return ResponseEntity.status(400).body("No resume uploaded to analyze");
            }

            ResumeAnalysis analysis = atsScoringService.generateAnalysis(user);
            
            // Map the entity to a clean response map
            Map<String, Object> response = new HashMap<>();
            response.put("name", user.getName());
            response.put("overallScore", analysis.getOverallScore());
            response.put("keywordScore", analysis.getKeywordScore());
            response.put("projectRelevanceScore", analysis.getProjectRelevanceScore());
            response.put("experienceScore", analysis.getExperienceScore());
            
            response.put("detectedSkills", analysis.getDetectedSkills().isEmpty() ? new ArrayList<>() : List.of(analysis.getDetectedSkills().split(",")));
            response.put("missingKeywords", analysis.getMissingKeywords().isEmpty() ? new ArrayList<>() : List.of(analysis.getMissingKeywords().split(",")));
            response.put("weakSections", analysis.getWeakSections().isEmpty() ? new ArrayList<>() : List.of(analysis.getWeakSections().split("\\|")));
            response.put("improvementChecklist", analysis.getImprovementChecklist().isEmpty() ? new ArrayList<>() : List.of(analysis.getImprovementChecklist().split("\\|")));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error analyzing resume: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to analyze resume");
        }
    }
}
