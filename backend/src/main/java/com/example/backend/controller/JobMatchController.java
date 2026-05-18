package com.example.backend.controller;

import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import com.example.backend.service.JobAggregatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class JobMatchController {

    @Autowired
    private UserProfileRepository userRepository;

    @Autowired
    private JobAggregatorService jobAggregatorService;

    @GetMapping("/match-jobs/{userId}")
    public List<Map<String, Object>> matchJobs(@PathVariable Long userId) {

        UserProfile user = userRepository.findById(userId).orElseThrow();

        String resumeText = user.getResumeText() != null ? user.getResumeText().toLowerCase() : "";
        String userSkills = user.getSkills() != null ? user.getSkills().toLowerCase() : "";

        List<Job> jobs = jobAggregatorService.getAggregatedJobs(user);

        List<Map<String, Object>> results = new ArrayList<>();

        for (Job job : jobs) {
            if (job.getSkillsRequired() == null) continue;

            String[] requiredSkills =
                    job.getSkillsRequired().toLowerCase().split(",");

            int matched = 0;

            for (String skill : requiredSkills) {
                String cleanSkill = skill.trim();
                if (resumeText.contains(cleanSkill) || userSkills.contains(cleanSkill)) {
                    matched++;
                }
            }

            double percentage = requiredSkills.length > 0 
                    ? ((double) matched / requiredSkills.length) * 100 
                    : 0;

            Map<String, Object> map = new HashMap<>();

            map.put("id", job.getId());
            map.put("jobId", job.getId());
            map.put("title", job.getTitle());
            map.put("jobTitle", job.getTitle());
            map.put("company", job.getCompany());
            map.put("location", job.getLocation());
            map.put("salary", job.getSalary());
            map.put("sourcePlatform", job.getSourcePlatform());
            map.put("applyLink", job.getApplyLink());
            map.put("description", job.getDescription());
            map.put("skillsRequired", job.getSkillsRequired());
            map.put("matchPercentage", percentage);

            results.add(map);
        }
        
        results.sort((a, b) -> Double.compare(
                (Double) b.get("matchPercentage"),
                (Double) a.get("matchPercentage")
        ));

        return results;
    }
}
