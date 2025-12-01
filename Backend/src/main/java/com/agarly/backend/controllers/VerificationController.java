package com.agarly.backend.controllers;

import com.agarly.backend.models.StatusResponse;
import com.agarly.backend.models.User;
import com.agarly.backend.repos.UserRepository;
import com.agarly.backend.utils.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@CrossOrigin(origins = "http://localhost:4200/")
public class VerificationController {

    @Autowired
    private UserRepository userRepository;

//    private JwtTokenUtil jwtUtil;
    @PostMapping("/register/verify")
    public ResponseEntity<StatusResponse> verifyEmail(@RequestParam(name = "email") String email,
                                              @RequestParam(name = "otp") String otp) {
//        String emailString = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email);
        if (user == null || user.getOtp() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StatusResponse(("OTP Expired!")));
        }

        if (!user.getOtp().equals(otp)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StatusResponse(("Incorrect OTP!")));
        }
        user.setOtp(null);
        user.setVerified(true);
       userRepository.save(user);
        System.out.println(email+otp);
        return ResponseEntity.status(HttpStatus.CREATED).body(new StatusResponse("Email successfully verified!"));
    }

}
