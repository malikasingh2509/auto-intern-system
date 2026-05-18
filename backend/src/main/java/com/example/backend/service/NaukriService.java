package com.example.backend.service;

import com.example.backend.model.Job;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class NaukriService implements PlatformJobService {

    @Override
    public List<Job> fetchJobs(String role, String location, String type) {
        List<Job> jobs = new ArrayList<>();
        
        String finalRole = (role != null && !role.isEmpty()) ? role : "Backend Developer";
        String finalLocation = (location != null && !location.isEmpty()) ? location : "Pune";
        
        Job job1 = new Job();
        job1.setId(301L);
        job1.setTitle("Associate " + finalRole);
        job1.setCompany("Infosys");
        job1.setSkillsRequired("Java, Spring Boot, MySQL, Git, REST API");
        job1.setLocation(finalLocation);
        job1.setSalary("₹6,00,000 - ₹9,00,000");
        job1.setSourcePlatform("Naukri");
        job1.setApplyLink("https://naukri.com/job/301");
        job1.setDescription("Join Infosys as an Associate " + finalRole + ". You will be part of a dynamic team developing robust backend solutions for global clients.");
        
        Job job2 = new Job();
        job2.setId(302L);
        job2.setTitle("Senior Fullstack Engineer (" + finalRole + ")");
        job2.setCompany("TCS");
        job2.setSkillsRequired("React, Spring Boot, MySQL, Cloud, Docker");
        job2.setLocation("Mumbai / " + finalLocation);
        job2.setSalary("₹12,00,000 - ₹18,00,000");
        job2.setSourcePlatform("Naukri");
        job2.setApplyLink("https://naukri.com/job/302");
        job2.setDescription("TCS is looking for a Senior Fullstack Engineer. Lead end-to-end delivery of enterprise applications with a strong focus on clean architecture and cloud deployments.");
        
        jobs.add(job1);
        jobs.add(job2);
        
        return jobs;
    }
}
