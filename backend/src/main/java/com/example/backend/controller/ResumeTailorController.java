package com.example.backend.controller;

import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.JobRepository;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class ResumeTailorController {

    @Autowired
    private UserProfileRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @GetMapping("/tailor-resume/{userId}/{jobId}")
    public String tailorResume(
            @PathVariable Long userId,
            @PathVariable Long jobId
    ) {

        UserProfile user =
                userRepository.findById(userId).orElseThrow();

        Job job =
                jobRepository.findById(jobId).orElseThrow();

        String originalResume =
                user.getResumeText();

        String tailoredResume =
                originalResume
                        + "\n\nOptimized For: "
                        + job.getTitle()
                        + "\nRelevant Skills: "
                        + job.getSkillsRequired()
                        + "\nProjects using "
                        + job.getSkillsRequired();

        return tailoredResume;
    }
}
