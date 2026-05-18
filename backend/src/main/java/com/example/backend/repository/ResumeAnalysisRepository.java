package com.example.backend.repository;

import com.example.backend.model.ResumeAnalysis;
import com.example.backend.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {
    Optional<ResumeAnalysis> findByUserProfile(UserProfile userProfile);
}
