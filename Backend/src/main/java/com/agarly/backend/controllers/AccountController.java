package com.agarly.backend.controllers;

import com.agarly.backend.models.LoginCredentials;
import com.agarly.backend.models.User;
import com.agarly.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/account")
public class AccountController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> signup(@RequestBody User user) {
        if(!(userService.existsByUsername(user.getUsername())) &&
                !(userService.existsByEmail(user.getEmail()))) {
            return new ResponseEntity<>(userService.save(user), HttpStatus.CREATED);
        }

        return new ResponseEntity<>(HttpStatus.CONFLICT);
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
}
