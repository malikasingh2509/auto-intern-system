package com.example.backend.service;

import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class JobAggregatorService {

    @Autowired
    private LinkedInService linkedInService;

    @Autowired
    private InternshalaService internshalaService;

    @Autowired
    private NaukriService naukriService;

    public List<Job> getAggregatedJobs(UserProfile user) {
        List<Job> allJobs = new ArrayList<>();
        
        String role = user.getPreferredRoles();
        String location = user.getPreferredLocations();
        String type = user.getJobTypePreference();
        
        // Dynamically aggregate jobs from active connected platforms!
        if (user.getLinkedinUrl() != null && !user.getLinkedinUrl().isEmpty()) {
            allJobs.addAll(linkedInService.fetchJobs(role, location, type));
        }
        if (user.getInternshalaUrl() != null && !user.getInternshalaUrl().isEmpty()) {
            allJobs.addAll(internshalaService.fetchJobs(role, location, type));
        }
        if (user.getNaukriUrl() != null && !user.getNaukriUrl().isEmpty()) {
            allJobs.addAll(naukriService.fetchJobs(role, location, type));
        }
        
        // Fallback to all mock providers if no platforms are connected yet, ensuring UI is never empty!
        if (allJobs.isEmpty()) {
            allJobs.addAll(linkedInService.fetchJobs(role, location, type));
            allJobs.addAll(internshalaService.fetchJobs(role, location, type));
            allJobs.addAll(naukriService.fetchJobs(role, location, type));
        }
        
        return allJobs;
    }
}
