package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    private String company;
    private LocalDateTime interviewDate;
    private String roundType; // "Technical", "HR", "Managerial"
    private String meetingLink;
    
    @Column(columnDefinition = "TEXT")
    private String notes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public LocalDateTime getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDateTime interviewDate) { this.interviewDate = interviewDate; }
    public String getRoundType() { return roundType; }
    public void setRoundType(String roundType) { this.roundType = roundType; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
