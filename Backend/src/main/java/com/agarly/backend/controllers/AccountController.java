package com.agarly.backend.controllers;

import com.agarly.backend.models.JWTResponse;
import com.agarly.backend.models.LoginCredentials;
import com.agarly.backend.models.StatusResponse;
import com.agarly.backend.models.User;
import com.agarly.backend.services.EmailService;
import com.agarly.backend.services.JWTService;
import com.agarly.backend.services.UserService;
//import com.agarly.backend.utils.JwtTokenUtil;
import com.agarly.backend.utils.OtpGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity <StatusResponse> register(@RequestBody User user) {
        if (userService.findByUsername(user.getUsername()) != null) {
            return new ResponseEntity<>(new StatusResponse("Username is already in use"), HttpStatus.BAD_REQUEST);
        }
        User existingUser = userService.findByEmail(user.getEmail());
        if(existingUser != null) {
            if(existingUser.getVerified()) {
                return new ResponseEntity<>(new StatusResponse("Email is already in use"), HttpStatus.BAD_REQUEST);
            }
//            String otp = JwtTokenUtil.generateToken(existingUser.getEmail());
            OtpGenerator generator = new OtpGenerator();
            System.out.println("otp initialized");
            String otp = generator.generateOTP();
            System.out.println("otp generated");
            existingUser.setOtp(otp);
            System.out.println("otp set");
            userService.save(existingUser);
            System.out.println("user saved");
            emailService.sendVerificationEmail(existingUser.getEmail(), otp);
            System.out.println("email sent");
            return new ResponseEntity<>(new StatusResponse(otp), HttpStatus.OK);
        }
//        String verificationToken = JwtTokenUtil.generateToken(user.getEmail());
//        user.setVerificationToken(verificationToken);
        OtpGenerator generator = new OtpGenerator();
        String otp = generator.generateOTP();
        user.setOtp(otp);
        System.out.println(user.getOtp());
        userService.save(user);
        emailService.sendVerificationEmail(user.getEmail(), otp);
        return new ResponseEntity<>(new StatusResponse(otp), HttpStatus.OK);
    }

    @PostMapping("/login")

    public ResponseEntity<JWTResponse> login(@RequestBody LoginCredentials user) {
        if((userService.existsByEmail(user.getEmail()))) {
            String JwtToken=userService.verify(user);
            if(!(JwtToken.equals("Fail"))) {
                return new ResponseEntity<>(new JWTResponse(JwtToken),HttpStatus.OK);
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

    public ResponseEntity<JWTResponse> googleLogin(@RequestBody com.agarly.backend.models.GoogleLoginRequest request) {
        User user = userService.loginWithGoogle(request.getIdToken());
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        userService.save(user);
        String token = jwtService.generateToken(user.getUsername());
        return new ResponseEntity<>(new JWTResponse(token), HttpStatus.OK);
    }


}
