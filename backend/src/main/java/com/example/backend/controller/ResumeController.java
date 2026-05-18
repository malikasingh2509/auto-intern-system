package com.example.backend.controller;

import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.Loader;

import java.io.File;
import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private UserProfileRepository repository;

    @PostMapping("/upload-resume/{id}")
    public ResponseEntity<String> uploadResume(
            @PathVariable Long id,
            @RequestParam("file")MultipartFile file
            ) {
        try {
            String uploadPath = System.getProperty("user.dir") + "/uploads/";
            File uploadDir = new File(uploadPath);
            if(!uploadDir.exists()){
                uploadDir.mkdir();
            }
            String fileName = file.getOriginalFilename();
            File dest = new File(uploadPath + fileName);
            file.transferTo(dest);
            UserProfile user = repository.findById(id).orElseThrow();
            user.setResume(fileName);
            
            try {
                PDDocument document = Loader.loadPDF(dest);
                PDFTextStripper pdfStripper = new PDFTextStripper();
                String extractedText = pdfStripper.getText(document);
                user.setResumeText(extractedText);
                document.close();
            } catch (Exception e) {
                System.err.println("Failed to parse PDF: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid PDF format or corrupted file.");
            }

            repository.save(user);
            return ResponseEntity.ok("Resume uploaded Successfully");
        } catch (Exception e) {
            System.err.println("Failed to upload resume: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload resume.");
        }
    }
}
