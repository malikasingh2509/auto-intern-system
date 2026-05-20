package com.example.backend.controller;

import com.example.backend.model.Application;
import com.example.backend.service.ApplicationTrackerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/applications")
public class ApplicationController {

    @Autowired
    private ApplicationTrackerService trackerService;

    @PostMapping("/{userId}")
    public Application createApplication(@PathVariable Long userId, @RequestBody Application application) {
        return trackerService.createApplication(userId, application);
    }

    @GetMapping("/user/{userId}")
    public List<Application> getUserApplications(@PathVariable Long userId) {
        return trackerService.getApplicationsByUser(userId);
    }

    @PutMapping("/{appId}/status")
    public Application updateStatus(@PathVariable Long appId, @RequestBody Map<String, String> body) {
        return trackerService.updateApplicationStatus(appId, body.get("status"));
    }

    @PutMapping("/{appId}/notes")
    public Application updateNotes(@PathVariable Long appId, @RequestBody Map<String, String> body) {
        return trackerService.updateApplicationNotes(appId, body.get("notes"));
    }

    @GetMapping("/{appId}/history")
    public List<com.example.backend.model.ApplicationHistory> getApplicationHistory(@PathVariable Long appId) {
        return trackerService.getApplicationHistory(appId);
    }

    /** Delete a single application by ID */
    @DeleteMapping("/{appId}")
    public void deleteApplication(@PathVariable Long appId) {
        trackerService.deleteApplication(appId);
    }

    /** Bulk-delete all fake auto-applied records for a user (notes = 'Applied via Job Board' etc.) */
    @DeleteMapping("/user/{userId}/cleanup-fake")
    public Map<String, Object> cleanupFake(@PathVariable Long userId) {
        int deleted = trackerService.deleteFakeApplications(userId);
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("deleted", deleted);
        result.put("message", "Removed " + deleted + " auto-applied fake records.");
        return result;
    }
}
