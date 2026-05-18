package com.example.backend.controller;

import com.example.backend.model.GeneratedResume;
import com.example.backend.model.Job;
import com.example.backend.service.AIAnalysisService;
import com.example.backend.service.CVGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/ai")
public class AIAssistantController {

    @Autowired
    private AIAnalysisService aiAnalysisService;

    @Autowired
    private CVGeneratorService cvGeneratorService;

    @PostMapping("/analyze-job/{userId}")
    public Map<String, Object> analyzeJob(@PathVariable Long userId, @RequestBody Job job) {
        return aiAnalysisService.analyzeJobMatch(userId, job);
    }

    @PostMapping("/generate-cv/{userId}")
    public GeneratedResume generateCV(@PathVariable Long userId, @RequestBody Job job) {
        return cvGeneratorService.generateTailoredCV(userId, job);
    }
}
