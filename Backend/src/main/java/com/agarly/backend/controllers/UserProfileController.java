package com.agarly.backend.controllers;

import com.agarly.backend.services.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserProfileController {
    @Autowired
    private UserProfileService userProfileService;

    @PutMapping("/profile")
    public void updateProfile() {
        userProfileService.updateProfile();
    }

    @PatchMapping("/password")
    public void changePassword() {
        userProfileService.changePassword();
    }
}
