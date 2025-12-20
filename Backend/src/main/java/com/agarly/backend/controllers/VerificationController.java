package com.agarly.backend.controllers;

import com.agarly.backend.models.StatusResponse;
import com.agarly.backend.models.User;
import com.agarly.backend.repos.UserRepository;
import com.agarly.backend.services.EmailService;
import com.agarly.backend.utils.OtpGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class VerificationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register/verify")
    public ResponseEntity<StatusResponse> verifyEmail(@RequestParam(name = "email") String email,
            @RequestParam(name = "otp") String otp) {
        System.out.println("user verification");
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new StatusResponse("User not found!"));
        }

        if (user.getOtp() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponse("OTP expired! Please request a new one."));
        }

        System.out.println("comparing otp");
        if (!user.getOtp().equals(otp)) {
            System.out.println("otp not match");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StatusResponse("Incorrect OTP!"));
        }

        System.out.println("user verified");
        user.setOtp(null);
        user.setVerified(true);
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(new StatusResponse("Email successfully verified!"));
    }

    @PostMapping("/register/resend-otp")
    public ResponseEntity<StatusResponse> resendOTP(@RequestParam(name = "email") String email) {
        System.out.println("Resending OTP to: " + email);

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new StatusResponse("User not found!"));
        }

        if (Boolean.TRUE.equals(user.getVerified())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new StatusResponse("Email already verified!"));
        }

        // Generate new OTP
        OtpGenerator generator = new OtpGenerator();
        String newOtp = generator.generateOTP();
        user.setOtp(newOtp);
        userRepository.save(user);

        // Send email with new OTP
        emailService.sendVerificationEmail(email, newOtp);

        System.out.println("New OTP sent: " + newOtp);
        return ResponseEntity.ok(new StatusResponse("OTP resent successfully!"));
    }
}
