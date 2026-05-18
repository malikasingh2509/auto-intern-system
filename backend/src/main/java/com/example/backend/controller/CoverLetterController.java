package com.example.backend.controller;

import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.JobRepository;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class CoverLetterController {

    @Autowired
    private UserProfileRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @GetMapping("/generate-cover-letter/{userId}/{jobId}")
    public String generateCoverLetter(
            @PathVariable Long userId,
            @PathVariable Long jobId
    ) {

        UserProfile user =
                userRepository.findById(userId).orElseThrow();

        Job job =
                jobRepository.findById(jobId).orElseThrow();

        return
                "Dear Hiring Manager at "
                        + job.getCompany()

                        + ",\n\nI am excited to apply for the role of "
                        + job.getTitle()

                        + ". My experience in "
                        + user.getSkills()

                        + " along with my projects and technical background make me a strong candidate for this position."

                        + "\n\nI am passionate about software development and eager to contribute to your team."

                        + "\n\nSincerely,\n"
                        + user.getName();
    }
}
