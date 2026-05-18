package com.example.backend.repository;

import com.example.backend.model.ApplicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationHistoryRepository extends JpaRepository<ApplicationHistory, Long> {
    List<ApplicationHistory> findByApplicationIdOrderByTimestampDesc(Long applicationId);
}
