package com.example.backend.service;

import com.example.backend.model.Application;
import com.example.backend.model.ApplicationHistory;
import com.example.backend.model.Notification;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.ApplicationHistoryRepository;
import com.example.backend.repository.ApplicationRepository;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationTrackerService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private ApplicationHistoryRepository historyRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private EmailService emailService;

    public Application createApplication(Long userId, Application reqApp) {
        UserProfile user = userProfileRepository.findById(userId).orElse(null);
        if (user == null) return null;

        reqApp.setUser(user);
        reqApp.setAppliedDate(LocalDateTime.now());
        if (reqApp.getStatus() == null) {
            reqApp.setStatus("Applied");
        }
        Application saved = applicationRepository.save(reqApp);
        emailService.sendEmail(user.getEmail(), "Application Submitted: " + saved.getJobTitle(), "Hello " + user.getName() + ",\n\nYou have successfully applied for the " + saved.getJobTitle() + " position at " + saved.getCompany() + ".\n\nGood luck!\nAI Career Team");
        return saved;
    }

    public List<Application> getApplicationsByUser(Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    public Application updateApplicationStatus(Long appId, String newStatus) {
        Application app = applicationRepository.findById(appId).orElse(null);
        if (app != null) {
            String oldStatus = app.getStatus();
            app.setStatus(newStatus);
            app = applicationRepository.save(app);

            // 1. Log History
            ApplicationHistory history = new ApplicationHistory();
            history.setApplication(app);
            history.setStatusStage(newStatus);
            historyRepository.save(history);

            // 2. Create Notification
            if (!newStatus.equals(oldStatus)) {
                Notification notif = new Notification();
                notif.setUser(app.getUser());
                notif.setType("STATUS_UPDATE");
                notif.setMessage("Application for " + app.getJobTitle() + " at " + app.getCompany() + " moved to " + newStatus);
                notificationRepository.save(notif);
                
                // 3. Push to WebSocket
                messagingTemplate.convertAndSend("/topic/notifications/" + app.getUser().getId(), notif);
                
                // 4. Send Email Notification
                emailService.sendEmail(app.getUser().getEmail(), "Status Update: " + app.getJobTitle(), "Hello " + app.getUser().getName() + ",\n\nYour application for " + app.getJobTitle() + " at " + app.getCompany() + " has moved to the " + newStatus + " stage.\n\nBest,\nAI Career Team");
            }

            return app;
        }
        return null;
    }

    public Application updateApplicationNotes(Long appId, String notes) {
        Application app = applicationRepository.findById(appId).orElse(null);
        if (app != null) {
            app.setNotes(notes);
            return applicationRepository.save(app);
        }
        return null;
    }

    public List<ApplicationHistory> getApplicationHistory(Long appId) {
        return historyRepository.findByApplicationIdOrderByTimestampDesc(appId);
    }

    /**
     * Delete a single application and all its related history/interviews.
     */
    public void deleteApplication(Long appId) {
        applicationRepository.findById(appId).ifPresent(app -> {
            historyRepository.deleteAll(historyRepository.findByApplicationIdOrderByTimestampDesc(appId));
            applicationRepository.delete(app);
        });
    }

    /**
     * Bulk-delete all fake auto-applied records for a user.
     * Targets records with notes that were written by the old auto-apply logic.
     */
    public int deleteFakeApplications(Long userId) {
        List<String> fakeNotes = List.of(
            "Applied via Job Board",
            "Applied via AI Career Dashboard",
            "Testing notes",
            "Manually marked as applied",
            "Manually marked as applied from Job Details"
        );
        List<Application> fakeApps = applicationRepository.findByUserIdAndNotesIn(userId, fakeNotes);
        for (Application app : fakeApps) {
            historyRepository.deleteAll(historyRepository.findByApplicationIdOrderByTimestampDesc(app.getId()));
        }
        applicationRepository.deleteAll(fakeApps);
        return fakeApps.size();
    }
}
