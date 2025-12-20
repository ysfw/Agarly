package com.agarly.backend.controllers;

import com.agarly.backend.dtos.PasswordChangeRequest;
import com.agarly.backend.dtos.UserProfileDTO;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.services.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@AuthenticationPrincipal
@interface CurrentUser {
}
// custom annotation so I don't keep saying "if (principal != null)" for every
// endpoint

@RestController
@RequestMapping("/users")
public class UserProfileController {
    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile(@CurrentUser UserPrincipal principal) {
        UserProfileDTO profile = userProfileService.getProfile(principal.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@CurrentUser UserPrincipal principal, @RequestBody UserProfileDTO request) {
        userProfileService.updateProfile(principal.getUsername(), request);
        return ResponseEntity.ok("User Profile Updated Successfully :D");
    }

    @PatchMapping("/password")
    public ResponseEntity<?> changePassword(@CurrentUser UserPrincipal principal,
            @RequestBody PasswordChangeRequest request) {
        userProfileService.changePassword(principal, request);
        return ResponseEntity.ok("Password Changed Successfully :D");
    }
}
