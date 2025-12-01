package com.agarly.backend.controllers;

import com.agarly.backend.models.User;
import com.agarly.backend.repos.UserRepository;
import com.agarly.backend.utils.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:4200/")
@RestController
public class VerificationController {

    @Autowired
    private UserRepository myAppUserRepository;

    @Autowired
    private JwtTokenUtil jwtUtil;

    @CrossOrigin(origins = "http://localhost:4200/signup/verify")
    @GetMapping("/register/verify")

    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        String emailString = jwtUtil.extractEmail(token);
        User user = myAppUserRepository.findByEmail(emailString);
        if (user == null || user.getVerificationToken() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Token Expired!");
        }

        if (!jwtUtil.validateToken(token) || !user.getVerificationToken().equals(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Token Expired!");
        }
        user.setVerificationToken(null);
        user.setVerified(true);
        myAppUserRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("Email successfully verified!");
    }

}
