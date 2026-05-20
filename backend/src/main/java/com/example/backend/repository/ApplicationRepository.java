package com.example.backend.repository;

import com.example.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserId(Long userId);

    List<Application> findByUserIdAndNotesIn(Long userId, List<String> notes);

    @Modifying
    @Query("DELETE FROM Application a WHERE a.id = :id")
    void deleteById(@Param("id") Long id);
}
