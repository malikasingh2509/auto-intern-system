package com.example.backend.controller;

import java.util.*;
import com.example.backend.model.UserProfile;
import com.example.backend.repository.UserProfileRepository;
import com.example.backend.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins ="*")
@RestController
@RequestMapping("/user")
public class UserProfileController {
    @Autowired
    private UserProfileService service;
    @PostMapping
    public UserProfile saveUser(@RequestBody UserProfile user){
        return service.save(user);
    }
    @GetMapping
    public List<UserProfile>getAllUsers(){
        return service.getAllUsers();
    }
    @GetMapping("/email/{email}")
    public UserProfile getUserByEmail(@PathVariable String email){
        return service.findByEmail(email);
    }
}
