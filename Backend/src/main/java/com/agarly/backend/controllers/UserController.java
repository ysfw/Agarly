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
}
