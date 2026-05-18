package com.example.backend.controller;

import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserProfileRepository repository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public String register(@RequestBody UserProfile user) {
        UserProfile existingUser = repository.findByEmail(user.getEmail());
        if (existingUser != null) {
            return "Email Already Exists";
        }
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        repository.save(user);
        return "Account Created";
    }

    @PostMapping("/login")
    public String login(@RequestBody UserProfile user) {
        UserProfile existingUser = repository.findByEmail(user.getEmail());
        if (existingUser == null) {
            return "User Not Found";
        }
        if (existingUser.getPassword() == null || user.getPassword() == null) {
            return "Invalid Password";
        }

        // Try BCrypt first (for new accounts), fallback to plain text for existing accounts
        boolean matches;
        String stored = existingUser.getPassword();
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
            matches = passwordEncoder.matches(user.getPassword(), stored);
        } else {
            // Legacy plain-text password — upgrade it on successful login
            matches = stored.equals(user.getPassword());
            if (matches) {
                existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
                repository.save(existingUser);
            }
        }

        return matches ? "Login Success" : "Invalid Password";
    }
}