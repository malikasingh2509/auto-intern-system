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

    // ─────────────────────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────────────────────
    @PostMapping("/register")
    public String register(@RequestBody UserProfile user) {
        if (user.getEmail() == null || user.getPassword() == null || user.getName() == null) {
            return "Missing required fields";
        }
        UserProfile existingUser = repository.findByEmail(user.getEmail().trim().toLowerCase());
        if (existingUser != null) {
            return "Email Already Exists";
        }
        user.setEmail(user.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        repository.save(user);

        // Welcome email — async, non-blocking
        String body = "Hello " + user.getName() + ",\n\n"
            + "Welcome to Auto-Intern! Your account has been created successfully.\n\n"
            + "You can now log in and start exploring AI-powered job matching, resume analysis, and more.\n\n"
            + "Best regards,\nAuto-Intern Team";
        emailService.sendEmail(user.getEmail(), "Welcome to Auto-Intern!", body);

        return "Account Created";
    }

    // ─────────────────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────────────────
    @PostMapping("/login")
    public String login(@RequestBody UserProfile user) {
        if (user.getEmail() == null || user.getPassword() == null) {
            return "Invalid email or password";
        }
        UserProfile existingUser = repository.findByEmail(user.getEmail().trim().toLowerCase());
        if (existingUser == null) {
            return "Invalid email or password";
        }
        if (existingUser.getPassword() == null) {
            return "Invalid email or password";
        }

        boolean matches;
        String stored = existingUser.getPassword();
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
            matches = passwordEncoder.matches(user.getPassword(), stored);
        } else {
            // Legacy plain-text — upgrade on success
            matches = stored.equals(user.getPassword());
            if (matches) {
                existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
                repository.save(existingUser);
            }
        }

        if (matches) {
            // Login notification — async
            String body = "Hello " + existingUser.getName() + ",\n\n"
                + "You just logged in to your Auto-Intern account.\n\n"
                + "If this was not you, please reset your password immediately.\n\n"
                + "Best regards,\nAuto-Intern Team";
            emailService.sendEmail(existingUser.getEmail(), "Login Notification — Auto-Intern", body);
            return "Login Success";
        }
        return "Invalid email or password";
    }

    // ─────────────────────────────────────────────────────────
    // FORGOT PASSWORD — generate OTP & send via Brevo
    // ─────────────────────────────────────────────────────────
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return "Email is required";
        }
        email = email.trim().toLowerCase();

        UserProfile user = repository.findByEmail(email);
        if (user == null) {
            return "User Not Found";
        }

        // Rate limit: prevent resend within 60 seconds
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (user.getResetOtpExpiry() != null) {
            java.time.LocalDateTime lastSent = user.getResetOtpExpiry().minusMinutes(10);
            long secondsSinceLastOtp = java.time.Duration.between(lastSent, now).getSeconds();
            if (secondsSinceLastOtp < 60) {
                return "Please wait " + (60 - secondsSinceLastOtp) + " seconds before requesting a new OTP";
            }
        }

        // Generate 6-digit secure OTP
        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
        user.setResetOtp(otp);
        user.setResetOtpExpiry(now.plusMinutes(10));
        repository.save(user);

        String emailBody =
            "Hello " + user.getName() + ",\n\n"
            + "You requested a password reset for your Auto-Intern account.\n\n"
            + "Your One-Time Password (OTP) is:\n\n"
            + "        " + otp + "\n\n"
            + "This OTP expires in 10 minutes. Do NOT share it with anyone.\n\n"
            + "If you did not request this, please ignore this email — your account remains safe.\n\n"
            + "Best regards,\n"
            + "Auto-Intern Team";

        try {
            emailService.sendEmailSync(email, "Your Password Reset OTP — Auto-Intern", emailBody);
        } catch (Exception e) {
            System.err.println("[ForgotPassword] Email send failed: " + e.getMessage());
            return "Email Failed: " + e.getMessage();
        }

        return "OTP Sent";
    }

    // ─────────────────────────────────────────────────────────
    // VERIFY OTP
    // ─────────────────────────────────────────────────────────
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String otp   = request.get("otp");

        if (email == null || otp == null) {
            return "Email and OTP are required";
        }

        UserProfile user = repository.findByEmail(email.trim().toLowerCase());
        if (user == null) {
            return "User Not Found";
        }
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp.trim())) {
            return "Invalid OTP";
        }
        if (user.getResetOtpExpiry() != null && user.getResetOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            return "OTP Expired";
        }

        return "OTP Verified";
    }

    // ─────────────────────────────────────────────────────────
    // RESET PASSWORD
    // ─────────────────────────────────────────────────────────
    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody java.util.Map<String, String> request) {
        String email       = request.get("email");
        String newPassword = request.get("newPassword");
        String otp         = request.get("otp");

        if (email == null || newPassword == null || otp == null) {
            return "Missing required fields";
        }
        if (newPassword.length() < 6) {
            return "Password must be at least 6 characters";
        }

        UserProfile user = repository.findByEmail(email.trim().toLowerCase());
        if (user == null) {
            return "User Not Found";
        }
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp.trim())) {
            return "Invalid OTP";
        }
        if (user.getResetOtpExpiry() != null && user.getResetOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            return "OTP Expired";
        }

        // Hash and save new password, clear OTP
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        repository.save(user);

        System.out.println("[ResetPassword] Password updated for: " + email);

        // Confirmation email — async
        String body = "Hello " + user.getName() + ",\n\n"
            + "Your Auto-Intern password has been successfully reset.\n\n"
            + "You can now log in with your new password.\n\n"
            + "If you did not make this change, contact support immediately.\n\n"
            + "Best regards,\nAuto-Intern Team";
        emailService.sendEmail(email, "Password Reset Successful — Auto-Intern", body);

        return "Password Updated";
    }
}