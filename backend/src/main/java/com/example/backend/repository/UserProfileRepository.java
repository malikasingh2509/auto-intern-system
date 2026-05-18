package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.model.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile,Long>{
    UserProfile findByEmail(String email);
}

