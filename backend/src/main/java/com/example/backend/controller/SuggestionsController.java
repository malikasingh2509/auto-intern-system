package com.example.backend.controller;

import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class SuggestionsController {

    @Autowired
    private UserProfileRepository userRepository;

    @GetMapping("/suggestions/{userId}")
    public List<Map<String, String>> getSuggestions(@PathVariable Long userId) {
        List<Map<String, String>> suggestions = new ArrayList<>();
        
        UserProfile user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return suggestions;
        }

        String skills = user.getSkills() != null ? user.getSkills().toLowerCase() : "";
        String resumeText = user.getResumeText() != null ? user.getResumeText().toLowerCase() : "";

        // 1. Check for platform connections
        if (user.getLinkedinUrl() == null || user.getLinkedinUrl().isEmpty()) {
            Map<String, String> sug = new HashMap<>();
            sug.put("title", "Optimize Professional Presence");
            sug.put("message", "Connect your LinkedIn profile in Profile Settings to unlock professional networking and boost employer visibility by 40%.");
            suggestions.add(sug);
        }

        if (user.getInternshalaUrl() == null || user.getInternshalaUrl().isEmpty()) {
            Map<String, String> sug = new HashMap<>();
            sug.put("title", "Find Student Internships");
            sug.put("message", "Link your Internshala profile to access student-focused internship programs and trigger automated matching.");
            suggestions.add(sug);
        }

        if (user.getNaukriUrl() == null || user.getNaukriUrl().isEmpty()) {
            Map<String, String> sug = new HashMap<>();
            sug.put("title", "Access Corporate Openings");
            sug.put("message", "Connect Naukri to discover large-scale corporate full-time job openings matching your domain experience.");
            suggestions.add(sug);
        }

        // 2. Check for career preferences completeness
        if (user.getPreferredRoles() == null || user.getPreferredRoles().isEmpty() ||
            user.getPreferredLocations() == null || user.getPreferredLocations().isEmpty()) {
            Map<String, String> sug = new HashMap<>();
            sug.put("title", "Define Career Targets");
            sug.put("message", "Add your preferred roles, locations, and salary expectations to let the AI job aggregator query tailored postings for you.");
            suggestions.add(sug);
        }

        // 3. Technical & Resume content checks
        if (!skills.contains("spring") && !resumeText.contains("spring")) {
            Map<String, String> sug = new HashMap<>();
            sug.put("title", "Add Spring Boot Projects");
            sug.put("message", "Your career profile and resume are missing Spring Boot. Add backend projects utilizing REST controllers and JPA to increase matching rates.");
            suggestions.add(sug);
        }

        if (!skills.contains("rest") && !resumeText.contains("rest")) {
            Map<String, String> sug = new HashMap<>();
            sug.put("title", "Improve ATS Keywords");
            sug.put("message", "Incorporate technical terms like REST API, Microservices, Hibernate, and JWT into your skills listing to satisfy automated ATS search filters.");
            suggestions.add(sug);
        }

        if (!skills.contains("docker") && !skills.contains("aws") && !resumeText.contains("docker")) {
            Map<String, String> sug = new HashMap<>();
            sug.put("title", "Add Deployment Experience");
            sug.put("message", "Highlight cloud deployment experience using AWS, Docker, Render, or Railway to display production-level capability to recruiters.");
            suggestions.add(sug);
        }

        // Fallback standard recommendations to ensure the page always feels rich and useful
        if (suggestions.size() < 3) {
            Map<String, String> sug = new HashMap<>();
            sug.put("title", "Highlight Open Source Contributions");
            sug.put("message", "Add your GitHub profile to showcase real collaborative projects, pull requests, and clean programming methodologies.");
            suggestions.add(sug);
        }

        return suggestions;
    }
}
