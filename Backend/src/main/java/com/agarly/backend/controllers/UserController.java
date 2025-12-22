package com.agarly.backend.controllers;

import com.agarly.backend.models.Item;
import com.agarly.backend.models.User;
import com.agarly.backend.dtos.PublicUserProfileDTO;
import com.agarly.backend.repos.ItemRepository;
import com.agarly.backend.repos.ReviewRepository;
import com.agarly.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    UserService userService;

    @Autowired
    ItemRepository itemRepository;

    @Autowired
    ReviewRepository reviewRepository;

    @Autowired
    private com.agarly.backend.services.EmailService emailService;

    @Autowired
    private com.agarly.backend.services.JWTService jwtService;

    @GetMapping("username/{username}")
    public ResponseEntity<User> findByUsername(@PathVariable String username) {
        User user = userService.findByUsername(username);

        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("email/{email}")
    public ResponseEntity<User> findByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);

        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Public profile endpoint for viewing other users
    @GetMapping("/{id}")
    public ResponseEntity<PublicUserProfileDTO> getUserProfile(@PathVariable Long id) {
        User user = userService.findById(id);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Count total items posted by user
        Long totalItems = itemRepository.countByOwner(user);

        // Get live average rating from reviews
        Double avgRating = reviewRepository.findAverageRatingByUserId(id).orElse(0.0);

        // Return safe DTO without sensitive data
        PublicUserProfileDTO profile = new PublicUserProfileDTO(user, totalItems, avgRating);
        return ResponseEntity.ok(profile);
    }

    // Get items published by a specific user (public, only approved items)
    @GetMapping("/{id}/items")
    public ResponseEntity<List<Item>> getUserItems(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Get only approved items published by this user
        List<Item> items = itemRepository.findByOwnerAndStatus(user, 
            com.agarly.backend.models.Enums.ItemStatus.APPROVED);
        return ResponseEntity.ok(items);
    }

    // Resend verification email for logged-in users
    @PostMapping("/resend-verification")
    public ResponseEntity<com.agarly.backend.models.StatusResponse> resendVerification(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new com.agarly.backend.models.StatusResponse("User not found"));
            }

            if (Boolean.TRUE.equals(user.getVerified())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new com.agarly.backend.models.StatusResponse("Email already verified"));
            }

            com.agarly.backend.utils.OtpGenerator generator = new com.agarly.backend.utils.OtpGenerator();
            String newOtp = generator.generateOTP();
            user.setOtp(newOtp);
            userService.save(user);

            emailService.sendVerificationEmail(user.getEmail(), newOtp);

            return ResponseEntity.ok(new com.agarly.backend.models.StatusResponse("Verification email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new com.agarly.backend.models.StatusResponse("Failed to send verification email"));
        }
    }
}