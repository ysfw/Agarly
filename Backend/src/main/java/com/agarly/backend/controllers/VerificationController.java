package com.agarly.backend.controllers;

import com.agarly.backend.models.StatusResponse;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@CrossOrigin(origins = "http://localhost:4200/")
public class VerificationController {

    @Autowired
    private UserRepository userRepository;

//    private JwtTokenUtil jwtUtil;
//    @CrossOrigin(origins = "http://localhost:4200/")
//    @GetMapping("/register/verify")
    @PostMapping("/register/verify")
    public ResponseEntity<StatusResponse> verifyEmail(@RequestParam(name = "email") String email,
                                              @RequestParam(name = "otp") String otp) {
//        String emailString = jwtUtil.extractEmail(token);
        System.out.println("user verification");
        User user = userRepository.findByEmail(email);
//        if (user == null || user.getOtp() == null) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StatusResponse(("OTP Expired!")));
//        }
        System.out.println("comparing otp");
        if (!user.getOtp().equals(otp)) {
            System.out.println("otp not match");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StatusResponse(("Incorrect OTP!")));
        }
        System.out.println("user verified");
        user.setOtp(null);
        user.setVerified(true);
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(new StatusResponse("Email successfully verified!"));
    }

}
