package com.example.backend.controller;

import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.example.backend.service.EmailService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserProfileRepository repository;

    @Autowired
    private EmailService emailService;

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
        
        emailService.sendEmail(user.getEmail(), "Welcome to AI Career Dashboard!", "Hello " + user.getName() + ",\n\nYour account has been created successfully. Welcome to your AI-powered career assistant platform!\n\nBest,\nAI Career Team");
        
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

        if (matches) {
            emailService.sendEmail(existingUser.getEmail(), "Login Successful - AI Career", "Hello " + existingUser.getName() + ",\n\nYou have successfully logged in to your AI Career Dashboard. If this was not you, please secure your account immediately.\n\nBest,\nAI Career Team");
            return "Login Success";
        }
        return "Invalid Password";
    }
}