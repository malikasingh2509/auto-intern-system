package com.example.backend.controller;

import com.example.backend.model.Application;
import com.example.backend.model.Interview;
import com.example.backend.model.Notification;
import com.example.backend.repository.ApplicationRepository;
import com.example.backend.repository.InterviewRepository;
import com.example.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/interviews")
public class InterviewController {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/application/{applicationId}")
    public List<Interview> getInterviewsForApplication(@PathVariable Long applicationId) {
        return interviewRepository.findByApplicationId(applicationId);
    }

    @PostMapping("/application/{applicationId}")
    public Interview scheduleInterview(@PathVariable Long applicationId, @RequestBody Interview reqInterview) {
        Application app = applicationRepository.findById(applicationId).orElse(null);
        if (app == null) return null;

        reqInterview.setApplication(app);
        Interview saved = interviewRepository.save(reqInterview);

        // Generate Notification
        Notification notif = new Notification();
        notif.setUser(app.getUser());
        notif.setType("INTERVIEW");
        notif.setMessage("New Interview scheduled for " + app.getJobTitle() + " at " + reqInterview.getCompany());
        notif.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notif);

        messagingTemplate.convertAndSend("/topic/notifications/" + app.getUser().getId(), notif);

        return saved;
    }
}
