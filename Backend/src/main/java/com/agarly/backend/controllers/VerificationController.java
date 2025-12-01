package com.agarly.backend.controllers;

import com.agarly.backend.models.User;
import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class VerificationController {

    @Autowired
    private UserRepository userRepository;
    
//    private JwtTokenUtil jwtUtil;

    @GetMapping("/register/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam(name = "email") String email,
                                              @RequestParam(name = "otp") String otp) {
//        String emailString = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email);
        if (user == null || user.getOtp() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("OTP Expired!");
        }

        if (!user.getOtp().equals(otp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Incorrect OTP!");
        }
        user.setOtp(null);
        user.setVerified(true);
       userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("Email successfully verified!");
    }

}
