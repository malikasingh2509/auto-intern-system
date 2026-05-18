package com.example.backend.service;

import com.example.backend.model.Job;
import java.util.List;

public interface PlatformJobService {
    List<Job> fetchJobs(String role, String location, String type);
}
