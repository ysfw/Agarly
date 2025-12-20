package com.agarly.backend.controllers;

import com.agarly.backend.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @PostMapping("item/{itemId}")
    public ResponseEntity<?> addItemReview(@PathVariable Long itemId,
                                           @RequestParam Long reviewerId,
                                           @RequestParam int rating) {
        reviewService.addItemReview(reviewerId, itemId, rating);
        return ResponseEntity.ok("Item review added successfully");
    }

    @PostMapping("user/{targetUserId}")
    public ResponseEntity<?> addUserReview(@PathVariable Long targetUserId,
                                           @RequestParam Long reviewerId,
                                           @RequestParam int rating) {
        reviewService.addUserReview(reviewerId, targetUserId, rating);
        return ResponseEntity.ok("User review added successfully");
    }

    @GetMapping("item/{itemId}/average-rating")
    public ResponseEntity<Double> getAverageItemRating(@PathVariable Long itemId) {
        double averageRating = reviewService.getAverageItemRating(itemId);
        return ResponseEntity.ok(averageRating);
    }

    @GetMapping("user/{userId}/average-rating")
    public ResponseEntity<Double> getAverageUserRating(@PathVariable Long userId) {
        double averageRating = reviewService.getAverageUserRating(userId);
        return ResponseEntity.ok(averageRating);
    }
}
