package com.agarly.backend.repos;

import com.agarly.backend.models.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.targetUser.id = :userId")
    Optional<Double> findAverageRatingByUserId(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.targetItem.id = :userId")
    Optional<Double> findAverageRatingByTargetItemId(Long userId);

}
