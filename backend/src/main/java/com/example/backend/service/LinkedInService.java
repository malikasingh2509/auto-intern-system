package com.example.backend.service;

import com.example.backend.model.Job;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class LinkedInService implements PlatformJobService {

    @Override
    public List<Job> fetchJobs(String role, String location, String type) {
        List<Job> jobs = new ArrayList<>();
        
        String finalRole = (role != null && !role.isEmpty()) ? role : "Fullstack Developer";
        String finalLocation = (location != null && !location.isEmpty()) ? location : "Remote";
        
        Job job1 = new Job();
        job1.setId(101L);
        job1.setTitle("Senior " + finalRole);
        job1.setCompany("Google");
        job1.setSkillsRequired("React, Spring Boot, MySQL, Java");
        job1.setLocation(finalLocation);
        job1.setSalary("$150,000 - $200,000");
        job1.setSourcePlatform("LinkedIn");
        job1.setApplyLink("https://linkedin.com/jobs/view/101");
        job1.setDescription("As a Senior " + finalRole + " at Google, you will lead the development of highly scalable applications. You will be responsible for architecture and system design using cutting-edge technologies.");
        
        Job job2 = new Job();
        job2.setId(102L);
        job2.setTitle(finalRole + " - Cloud Infrastructure");
        job2.setCompany("Microsoft");
        job2.setSkillsRequired("React, TypeScript, Docker, AWS, Cloud");
        job2.setLocation("Seattle, WA / " + finalLocation);
        job2.setSalary("$140,000 - $180,000");
        job2.setSourcePlatform("LinkedIn");
        job2.setApplyLink("https://linkedin.com/jobs/view/102");
        job2.setDescription("Join Microsoft's Azure team as a " + finalRole + ". Build the next generation of cloud infrastructure focusing on reliability, scalability, and performance.");
        
        jobs.add(job1);
        jobs.add(job2);
        
        return jobs;
    }
}
