package com.agarly.backend.services;

import com.agarly.backend.models.Enums.ReviewTargetType;
import com.agarly.backend.models.Item;
import com.agarly.backend.models.Review;
import com.agarly.backend.models.User;
import com.agarly.backend.repos.ItemRepository;
import com.agarly.backend.repos.ReviewRepository;
import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ItemRepository itemRepository;

    public void addItemReview(Long reviewerId, Long itemId, Double rating) {
        User reviewer = userRepository.findById(reviewerId).orElseThrow(()->new RuntimeException("User not found"));
        Item item = itemRepository.findById(itemId).orElse(null);

        Review review = new Review();
        review.setReviewer(reviewer);
        review.setTargetItem(item);
        review.setRating(rating);
        review.setReviewTarget(ReviewTargetType.ITEM);
        reviewRepository.save(review);
    }

    public void addUserReview(Long reviewerId, Long targetUserId, Double rating) {
        System.out.println("Adding user review: reviewerId=" + reviewerId + ", targetUserId=" + targetUserId + ", rating=" + rating);
        User reviewer = userRepository.findById(reviewerId).orElseThrow(()->new RuntimeException("User not found"));
        User targetUser = userRepository.findById(targetUserId).orElseThrow(()->new RuntimeException("User not found"));

        Review review = new Review();
        review.setReviewer(reviewer);
        review.setTargetUser(targetUser);
        review.setRating(rating);
        review.setReviewTarget(ReviewTargetType.USER);
        reviewRepository.save(review);
    }

    public double getAverageItemRating(Long itemId) {
        return reviewRepository.findAverageRatingByTargetItemId(itemId).orElse(0.0);
    }

    public double getAverageUserRating(Long userId) {
        return reviewRepository.findAverageRatingByUserId(userId).orElse(0.0);
    }
}
