package com.example.backend.repository;

import com.example.backend.model.GeneratedResume;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GeneratedResumeRepository extends JpaRepository<GeneratedResume, Long> {
    List<GeneratedResume> findByUserId(Long userId);
}
