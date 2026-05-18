package com.example.backend.service;

import java.util.*;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {
    @Autowired
    private UserProfileRepository repository;
    public UserProfile save(UserProfile user){
        UserProfile existing = null;
        if (user.getId() != null) {
            existing = repository.findById(user.getId()).orElse(null);
        }
        if (existing == null && user.getEmail() != null) {
            existing = repository.findByEmail(user.getEmail());
        }

        if (existing != null) {
            if (user.getName() != null) existing.setName(user.getName());
            if (user.getEmail() != null) existing.setEmail(user.getEmail());
            if (user.getSkills() != null) existing.setSkills(user.getSkills());
            if (user.getExperience() != null) existing.setExperience(user.getExperience());
            if (user.getDomain() != null) existing.setDomain(user.getDomain());
            
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                existing.setPassword(user.getPassword());
            }
            if (user.getResume() != null) existing.setResume(user.getResume());
            if (user.getResumeText() != null) existing.setResumeText(user.getResumeText());
            
            if (user.getLinkedinUrl() != null) existing.setLinkedinUrl(user.getLinkedinUrl());
            if (user.getInternshalaUrl() != null) existing.setInternshalaUrl(user.getInternshalaUrl());
            if (user.getNaukriUrl() != null) existing.setNaukriUrl(user.getNaukriUrl());
            if (user.getPreferredRoles() != null) existing.setPreferredRoles(user.getPreferredRoles());
            if (user.getPreferredLocations() != null) existing.setPreferredLocations(user.getPreferredLocations());
            if (user.getJobTypePreference() != null) existing.setJobTypePreference(user.getJobTypePreference());
            if (user.getSalaryExpectations() != null) existing.setSalaryExpectations(user.getSalaryExpectations());
            
            return repository.save(existing);
        }
        return repository.save(user);
    }
    public List<UserProfile> getAllUsers(){
        return repository.findAll();
    }
    public UserProfile findByEmail(String email){
        return repository.findByEmail(email);
    }
}
