package com.agarly.backend.services;

import com.agarly.backend.repos.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    public void addReview() {
        // Add review logic
    }

    public double calculateAverageRating() {
        // Calculates average ratings
        return 0.0;
    }
}
