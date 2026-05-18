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
}
