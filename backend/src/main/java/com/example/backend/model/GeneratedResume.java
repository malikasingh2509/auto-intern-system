package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class GeneratedResume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile user;

    private String targetJobTitle;
    private String targetCompany;

    @Column(columnDefinition = "TEXT")
    private String tailoredContent;

    private LocalDateTime generatedDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserProfile getUser() {
        return user;
    }

    public void setUser(UserProfile user) {
        this.user = user;
    }

    public String getTargetJobTitle() {
        return targetJobTitle;
    }

    public void setTargetJobTitle(String targetJobTitle) {
        this.targetJobTitle = targetJobTitle;
    }

    public String getTargetCompany() {
        return targetCompany;
    }

    public void setTargetCompany(String targetCompany) {
        this.targetCompany = targetCompany;
    }

    public String getTailoredContent() {
        return tailoredContent;
    }

    public void setTailoredContent(String tailoredContent) {
        this.tailoredContent = tailoredContent;
    }

    public LocalDateTime getGeneratedDate() {
        return generatedDate;
    }

    public void setGeneratedDate(LocalDateTime generatedDate) {
        this.generatedDate = generatedDate;
    }

    @Column(columnDefinition = "TEXT")
    private String coverLetterContent;

    private Integer originalAtsScore;
    private Integer optimizedAtsScore;

    @Column(columnDefinition = "TEXT")
    private String addedKeywords;

    @Column(columnDefinition = "TEXT")
    private String reorderedSections;

    public String getCoverLetterContent() { return coverLetterContent; }
    public void setCoverLetterContent(String coverLetterContent) { this.coverLetterContent = coverLetterContent; }

    public Integer getOriginalAtsScore() { return originalAtsScore; }
    public void setOriginalAtsScore(Integer originalAtsScore) { this.originalAtsScore = originalAtsScore; }

    public Integer getOptimizedAtsScore() { return optimizedAtsScore; }
    public void setOptimizedAtsScore(Integer optimizedAtsScore) { this.optimizedAtsScore = optimizedAtsScore; }

    public String getAddedKeywords() { return addedKeywords; }
    public void setAddedKeywords(String addedKeywords) { this.addedKeywords = addedKeywords; }

    public String getReorderedSections() { return reorderedSections; }
    public void setReorderedSections(String reorderedSections) { this.reorderedSections = reorderedSections; }
}
