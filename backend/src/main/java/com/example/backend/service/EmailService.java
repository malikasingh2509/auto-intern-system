package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:smalika7489@gmail.com}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String text) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(to);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
            }
        });
    }
}
