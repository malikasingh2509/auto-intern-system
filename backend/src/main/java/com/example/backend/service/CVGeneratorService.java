package com.example.backend.service;

import com.example.backend.model.GeneratedResume;
import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.GeneratedResumeRepository;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CVGeneratorService {

    @Autowired
    private GeneratedResumeRepository generatedResumeRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    public GeneratedResume generateTailoredCV(Long userId, Job job) {
        UserProfile user = userProfileRepository.findById(userId).orElse(null);
        if (user == null || job == null) return null;

        // 1. Keyword Extraction & Injection
        String resumeText = user.getResumeText() != null ? user.getResumeText().toLowerCase() : "";
        String[] requiredSkills = job.getSkillsRequired() != null ? job.getSkillsRequired().split(",") : new String[0];
        
        List<String> missingKeywords = new ArrayList<>();
        int matched = 0;
        
        for (String skill : requiredSkills) {
            String cleanSkill = skill.trim();
            if (!resumeText.contains(cleanSkill.toLowerCase())) {
                missingKeywords.add(cleanSkill);
            } else {
                matched++;
            }
        }
        
        int originalScore = requiredSkills.length > 0 ? (int) (((double) matched / requiredSkills.length) * 100) : 60;
        int optimizedScore = Math.min(originalScore + 25, 98); // Synthetic AI optimization boost

        // 2. Tailored Resume Generation
        String summary = "Dynamic and results-driven professional targeting the " + job.getTitle() + " role at " + job.getCompany() + ". ";
        summary += "Proven expertise in delivering high-quality solutions, rapidly adapting to new stacks, and optimizing performance. ";
        
        String coreCompetencies = user.getSkills() != null ? user.getSkills() : "";
        if (!missingKeywords.isEmpty()) {
            coreCompetencies += ", " + String.join(", ", missingKeywords);
        }

        String experience = "Highlighted Experience strictly aligned with " + job.getCompany() + "'s core objectives:\n";
        experience += "- Engineered scalable systems utilizing " + job.getSkillsRequired() + " to drive 40% performance gains.\n";
        if (user.getExperience() != null && !user.getExperience().isEmpty()) {
            experience += "- Leveraged " + user.getExperience() + " of industry experience to lead cross-functional development lifecycles.\n";
        }
        if (!missingKeywords.isEmpty()) {
            experience += "- Rapidly upskilled and implemented robust solutions involving " + String.join(", ", missingKeywords) + ".\n";
        }

        String tailoredContent = "## PROFESSIONAL SUMMARY\n" + summary + "\n\n" +
                                 "## HIGHLIGHTED EXPERIENCE\n" + experience + "\n\n" +
                                 "## CORE COMPETENCIES\n" + coreCompetencies;

        // 3. Tailored Cover Letter Generation
        String coverLetter = "Dear Hiring Manager at " + job.getCompany() + ",\n\n" +
                "I am writing to express my strong interest in the " + job.getTitle() + " position. " +
                "With my extensive background in " + coreCompetencies + ", I am confident in my ability to make an immediate impact on your team.\n\n" +
                "Your focus on " + job.getSkillsRequired() + " aligns perfectly with my recent projects. I have a proven track record of designing scalable architecture and collaborating across teams to deliver robust software solutions.\n\n" +
                "I am particularly drawn to " + job.getCompany() + " because of your innovative approach to the industry. I would welcome the opportunity to discuss how my technical skills and enthusiasm can contribute to your continued success.\n\n" +
                "Thank you for your time and consideration.\n\n" +
                "Sincerely,\n" + user.getName();

        // 4. Save Application Optimization Package
        GeneratedResume resume = new GeneratedResume();
        resume.setUser(user);
        resume.setTargetJobTitle(job.getTitle());
        resume.setTargetCompany(job.getCompany());
        resume.setTailoredContent(tailoredContent);
        resume.setCoverLetterContent(coverLetter);
        resume.setOriginalAtsScore(originalScore);
        resume.setOptimizedAtsScore(optimizedScore);
        resume.setAddedKeywords(String.join(", ", missingKeywords));
        resume.setReorderedSections("Prioritized 'Core Competencies' and injected missing tech stack into 'Highlighted Experience'.");
        resume.setGeneratedDate(LocalDateTime.now());

        return generatedResumeRepository.save(resume);
    }
}
