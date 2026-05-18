package com.example.backend.controller;

import com.example.backend.model.Job;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.JobRepository;
import com.example.backend.repository.UserProfileRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;

@RestController
@CrossOrigin(origins = "*")
public class PdfController {

    @Autowired
    private UserProfileRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @GetMapping("/download-resume-pdf/{userId}/{jobId}")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable Long userId,
            @PathVariable Long jobId
    ) throws Exception {

        UserProfile user =
                userRepository.findById(userId).orElseThrow();

        Job job =
                jobRepository.findById(jobId).orElseThrow();

        String content =
                user.getResumeText()
                        + "\n\nOptimized For: "
                        + job.getTitle()
                        + "\nSkills: "
                        + job.getSkillsRequired();

        ByteArrayOutputStream out =
                new ByteArrayOutputStream();

        Document document =
                new Document();

        PdfWriter.getInstance(document, out);

        document.open();

        document.add(
                new Paragraph(content)
        );

        document.close();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=resume.pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(out.toByteArray());
    }
}
