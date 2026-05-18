package com.example.backend.service;

import com.example.backend.model.Job;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class InternshalaService implements PlatformJobService {

    @Override
    public List<Job> fetchJobs(String role, String location, String type) {
        List<Job> jobs = new ArrayList<>();
        
        String finalRole = (role != null && !role.isEmpty()) ? role : "Web Developer";
        String finalLocation = (location != null && !location.isEmpty()) ? location : "Remote";
        
        Job job1 = new Job();
        job1.setId(201L);
        job1.setTitle(finalRole + " Intern");
        job1.setCompany("InnovateTech");
        job1.setSkillsRequired("React, JavaScript, HTML, CSS, Tailwind");
        job1.setLocation(finalLocation);
        job1.setSalary("₹15,000 - ₹25,000 / month");
        job1.setSourcePlatform("Internshala");
        job1.setApplyLink("https://internshala.com/internship/detail/201");
        job1.setDescription("Looking for a passionate " + finalRole + " intern to join our fast-paced startup. You will work on real-world projects, optimizing frontend performance and building scalable UI components.");
        
        Job job2 = new Job();
        job2.setId(202L);
        job2.setTitle("Software Engineering Intern");
        job2.setCompany("PaySaaS");
        job2.setSkillsRequired("Spring Boot, Java, MySQL, REST API");
        job2.setLocation("Bangalore / " + finalLocation);
        job2.setSalary("₹20,000 - ₹35,000 / month");
        job2.setSourcePlatform("Internshala");
        job2.setApplyLink("https://internshala.com/internship/detail/202");
        job2.setDescription("PaySaaS is hiring a Software Engineering Intern. Gain hands-on experience designing and developing highly available enterprise APIs and microservices.");
        
        jobs.add(job1);
        jobs.add(job2);
        
        return jobs;
    }
}
