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
public class AutoApplyController {

    @Autowired
    private UserProfileRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @GetMapping("/auto-apply/{userId}")
    public List<Map<String, Object>> autoApply(
            @PathVariable Long userId
    ) {

        UserProfile user =
                userRepository.findById(userId).orElseThrow();

        String resumeText =
                user.getResumeText().toLowerCase();

        List<Job> jobs =
                jobRepository.findAll();

        List<Map<String, Object>> appliedJobs =
                new ArrayList<>();

        return appliedJobs;
    }
}
