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

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        UserProfile user = repository.findByEmail(email);
        if (user == null) {
            return "User Not Found";
        }
        
        // Generate 6 digit OTP using SecureRandom for better randomness
        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
        user.setResetOtp(otp);
        user.setResetOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        repository.save(user);

        String emailBody =
            "Hello " + user.getName() + ",\n\n" +
            "You requested a password reset for your AI Career Dashboard account.\n\n" +
            "Your One-Time Password (OTP) is:\n\n" +
            "  " + otp + "\n\n" +
            "This OTP is valid for 10 minutes. Do not share it with anyone.\n\n" +
            "If you did not request this, please ignore this email — your account is safe.\n\n" +
            "Best regards,\n" +
            "AI Career Dashboard Team";

        try {
            emailService.sendEmailSync(email, "Reset Your Password — AI Career Dashboard", emailBody);
        } catch (Exception e) {
            System.err.println("[ForgotPassword] Email send failed: " + e.getMessage());
            // OTP is saved in DB — return a descriptive error so user knows email failed
            return "Email Failed: " + e.getMessage();
        }

        return "OTP Sent";
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        UserProfile user = repository.findByEmail(email);
        if (user == null) {
            return "User Not Found";
        }
        
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            return "Invalid OTP";
        }
        
        if (user.getResetOtpExpiry() != null && user.getResetOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            return "OTP Expired";
        }
        
        return "OTP Verified";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        String otp = request.get("otp");
        
        UserProfile user = repository.findByEmail(email);
        if (user == null) {
            return "User Not Found";
        }
        
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            return "Invalid OTP";
        }
        
        if (user.getResetOtpExpiry() != null && user.getResetOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            return "OTP Expired";
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        repository.save(user);
        
        emailService.sendEmail(email, "Password Reset Successful", "Hello " + user.getName() + ",\n\nYour password has been successfully reset.\n\nBest,\nAI Career Team");
        
        return "Password Updated";
    }
}