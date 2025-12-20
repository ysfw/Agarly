package com.agarly.backend.dtos;

import com.agarly.backend.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for public user profile view (excludes sensitive data like password, OTP,
 * wallet balance)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicUserProfileDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String profileImageUrl;
    private double rating;
    private String bio;
    private String city;
    private String state;
    private Long totalItemsPosted;
    private LocalDateTime joinedDate;

    // Constructor for easy mapping from User entity
    public PublicUserProfileDTO(User user, Long totalItemsPosted) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.profileImageUrl = user.getProfileImageUrl();
        this.rating = user.getRating();
        this.bio = user.getProfile() != null ? user.getProfile().getBio() : "";
        this.city = user.getProfile() != null ? user.getProfile().getCity() : "";
        this.state = user.getProfile() != null ? user.getProfile().getState() : "";
        this.totalItemsPosted = totalItemsPosted;
        this.joinedDate = LocalDateTime.now(); // Placeholder - adjust if User has createdAt field
    }
}
