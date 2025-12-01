package com.agarly.backend.controllers;

import com.agarly.backend.models.LoginCredentials;
import com.agarly.backend.models.User;
import com.agarly.backend.services.EmailService;
import com.agarly.backend.services.JWTService;
import com.agarly.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/account")
public class AccountController {
    @Autowired
    private UserService userService;
    @Autowired
    private EmailService emailService;

    @Autowired
    private JWTService jwtService;

    @PostMapping("/register")
    public ResponseEntity <String> signup(@RequestBody User user) {
        if (userService.findByUsername(user.getUsername()) != null) {
            return new ResponseEntity<>("Username is already in use", HttpStatus.BAD_REQUEST);
        }
        User existingUser = userService.findByEmail(user.getEmail());
        if(existingUser != null) {
            if(existingUser.getVerified()) {
                return new ResponseEntity<>("Email is already in use", HttpStatus.BAD_REQUEST);
            }
            String verificationToken = "1234";
            existingUser.setVerificationToken(verificationToken);
            userService.save(existingUser);
            emailService.sendVerificationEmail(existingUser.getEmail(), verificationToken);
            return new ResponseEntity<>("Verification email sent", HttpStatus.OK);
        }
        String verificationToken = "1234";
        user.setVerificationToken(verificationToken);
        userService.save(user);
        emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        return new ResponseEntity<>("Registration successful, please verify your email", HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginCredentials user) {
        if((userService.existsByEmail(user.getEmail()))) {
            String JwtToken=userService.verify(user);
            if(!(JwtToken.equals("Fail"))) {
                return new ResponseEntity<>(JwtToken,HttpStatus.OK);
            }
            else{
                System.out.println("Invalid Credentials");
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
        }
        System.out.println("Invalid Credentials2");
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
    @PostMapping("/gAuth")
    public ResponseEntity<String> googleLogin(@RequestBody com.agarly.backend.models.GoogleLoginRequest request) {
        User user = userService.loginWithGoogle(request.getIdToken());
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        userService.save(user);
        String token = jwtService.generateToken(user.getUsername());
        return new ResponseEntity<>(token, HttpStatus.OK);
    }


}
