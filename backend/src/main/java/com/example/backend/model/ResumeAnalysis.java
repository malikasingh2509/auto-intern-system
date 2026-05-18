package com.example.backend.model;

import jakarta.persistence.*;

@Entity
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private UserProfile userProfile;

    private int overallScore;
    private int keywordScore;
    private int projectRelevanceScore;
    private int experienceScore;

    @Column(columnDefinition = "TEXT")
    private String detectedSkills;

    @Column(columnDefinition = "TEXT")
    private String missingKeywords;

    @Column(columnDefinition = "TEXT")
    private String weakSections;

    @Column(columnDefinition = "TEXT")
    private String improvementChecklist;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserProfile getUserProfile() { return userProfile; }
    public void setUserProfile(UserProfile userProfile) { this.userProfile = userProfile; }

    public int getOverallScore() { return overallScore; }
    public void setOverallScore(int overallScore) { this.overallScore = overallScore; }

    public int getKeywordScore() { return keywordScore; }
    public void setKeywordScore(int keywordScore) { this.keywordScore = keywordScore; }

    public int getProjectRelevanceScore() { return projectRelevanceScore; }
    public void setProjectRelevanceScore(int projectRelevanceScore) { this.projectRelevanceScore = projectRelevanceScore; }

    public int getExperienceScore() { return experienceScore; }
    public void setExperienceScore(int experienceScore) { this.experienceScore = experienceScore; }

    public String getDetectedSkills() { return detectedSkills; }
    public void setDetectedSkills(String detectedSkills) { this.detectedSkills = detectedSkills; }

    public String getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(String missingKeywords) { this.missingKeywords = missingKeywords; }

    public String getWeakSections() { return weakSections; }
    public void setWeakSections(String weakSections) { this.weakSections = weakSections; }

    public String getImprovementChecklist() { return improvementChecklist; }
    public void setImprovementChecklist(String improvementChecklist) { this.improvementChecklist = improvementChecklist; }
}
