package com.example.backend.model;

import jakarta.persistence.*;

@Entity
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private String name;
    @Column(unique = true)
    private String email;
    private String skills;
    private String experience;
    private String domain;

    public String getName(){ return name;}
    public void setName(String name){this.name = name;}

    public String getEmail(){ return  email;}
    public void setEmail(String email){this.email = email;}

    public String getSkills(){ return skills;}
    public void setSkills(String skills){this.skills = skills;}

    public String getExperience(){ return experience;}
    public void setExperience(String experience){this.experience = experience;}

    public String getDomain(){ return domain;}
    public void setDomain(String domain){this.domain = domain;}

    public Long getId(){return id;}

    private  String resume;

    public String getResume() {
        return resume;
    }

    public void setResume(String resume) {
        this.resume = resume;
    }
    @Column(columnDefinition = "TEXT")
    private String resumeText;

    public String getResumeText() {
        return resumeText;
    }

    public void setResumeText(String resumeText) {
        this.resumeText = resumeText;
    }
    private String password;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    private String linkedinUrl;
    private String internshalaUrl;
    private String naukriUrl;
    private String preferredRoles;
    private String preferredLocations;
    private String jobTypePreference;
    private String salaryExpectations;

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getInternshalaUrl() { return internshalaUrl; }
    public void setInternshalaUrl(String internshalaUrl) { this.internshalaUrl = internshalaUrl; }

    public String getNaukriUrl() { return naukriUrl; }
    public void setNaukriUrl(String naukriUrl) { this.naukriUrl = naukriUrl; }

    public String getPreferredRoles() { return preferredRoles; }
    public void setPreferredRoles(String preferredRoles) { this.preferredRoles = preferredRoles; }

    public String getPreferredLocations() { return preferredLocations; }
    public void setPreferredLocations(String preferredLocations) { this.preferredLocations = preferredLocations; }

    public String getJobTypePreference() { return jobTypePreference; }
    public void setJobTypePreference(String jobTypePreference) { this.jobTypePreference = jobTypePreference; }

    public String getSalaryExpectations() { return salaryExpectations; }
    public void setSalaryExpectations(String salaryExpectations) { this.salaryExpectations = salaryExpectations; }

    private String resetOtp;
    private java.time.LocalDateTime resetOtpExpiry;

    public String getResetOtp() { return resetOtp; }
    public void setResetOtp(String resetOtp) { this.resetOtp = resetOtp; }

    public java.time.LocalDateTime getResetOtpExpiry() { return resetOtpExpiry; }
    public void setResetOtpExpiry(java.time.LocalDateTime resetOtpExpiry) { this.resetOtpExpiry = resetOtpExpiry; }
}
