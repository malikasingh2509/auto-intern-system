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

        for (Job job : jobs) {

            String[] requiredSkills =
                    job.getSkillsRequired().toLowerCase().split(",");

            int matched = 0;

            for (String skill : requiredSkills) {

                if (resumeText.contains(skill.trim())) {
                    matched++;
                }
            }

            double percentage =
                    ((double) matched / requiredSkills.length) * 100;

            if (percentage >= 60) {

                Map<String, Object> map =
                        new HashMap<>();

                map.put("jobTitle", job.getTitle());

                map.put("company", job.getCompany());

                map.put("matchPercentage", percentage);

                map.put(
                        "status",
                        "Application Submitted"
                );

                appliedJobs.add(map);
            }
        }

        return appliedJobs;
    }
}
