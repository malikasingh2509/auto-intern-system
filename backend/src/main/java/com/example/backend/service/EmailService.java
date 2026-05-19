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

    // Async — fire-and-forget (used for welcome / login notifications)
    public void sendEmail(String to, String subject, String text) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                sendSync(to, subject, text);
            } catch (Exception e) {
                System.err.println("[EmailService] FAILED to send email to " + to + ": " + e.getMessage());
                e.printStackTrace();
            }
        });
    }

    // Synchronous — throws exception so caller can surface the error (used for OTP)
    public void sendEmailSync(String to, String subject, String text) throws Exception {
        sendSync(to, subject, text);
    }

    private void sendSync(String to, String subject, String text) throws Exception {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
        System.out.println("[EmailService] Email sent successfully to " + to);
    }
}
