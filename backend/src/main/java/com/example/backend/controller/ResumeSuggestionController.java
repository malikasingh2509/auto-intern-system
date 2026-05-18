package com.example.backend.controller;

import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.JobRepository;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class ResumeSuggestionController {

    @Autowired
    private UserProfileRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @GetMapping("/resume-suggestions/{userId}/{jobId}")
    public Map<String, Object> getSuggestions(
            @PathVariable Long userId,
            @PathVariable Long jobId
    ) {

        UserProfile user =
                userRepository.findById(userId).orElseThrow();

        Job job =
                jobRepository.findById(jobId).orElseThrow();

        String resumeText =
                user.getResumeText().toLowerCase();

        String[] requiredSkills =
                job.getSkillsRequired().split(",");

        List<String> missingSkills =
                new ArrayList<>();

        for (String skill : requiredSkills) {

            if (!resumeText.contains(skill.trim().toLowerCase())) {
                missingSkills.add(skill.trim());
            }
        }

        Map<String, Object> response =
                new HashMap<>();

        response.put("jobTitle", job.getTitle());

        response.put("missingSkills", missingSkills);

        response.put(
                "suggestion",
                "Add projects and experience using: "
                        + String.join(", ", missingSkills)
        );

        return response;
    }
}
