package com.agarly.backend.dtos;

import com.agarly.backend.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for public user profile view (excludes sensitive data like password, OTP,
 * wallet balance). Respects user privacy settings.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicUserProfileDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email; // Only shown if showContactInfo is true
    private String phoneNumber; // Only shown if showContactInfo is true
    private String profileImageUrl;
    private double rating;
    private String bio;
    private String city;
    private String state;
    private String address; // Only shown if hideAddress is false
    private Long totalItemsPosted;
    private java.math.BigDecimal walletBalance;
    private java.math.BigDecimal totalEarnings;
    private java.math.BigDecimal totalSpent;
    private LocalDateTime joinedDate;
    private Boolean blocked;
    private Boolean verified;

    // Privacy settings info for frontend to know what was hidden
    private String profileVisibility;
    private boolean isRestricted; // True if viewer cannot see full profile

    // Constructor for easy mapping from User entity (no privacy filtering)
    public PublicUserProfileDTO(User user, Long totalItemsPosted) {
        this(user, totalItemsPosted, user.getRating(), java.math.BigDecimal.ZERO, java.math.BigDecimal.ZERO, null,
                false);
    }

    // Constructor with live average rating from reviews and financials
    public PublicUserProfileDTO(User user, Long totalItemsPosted, Double avgRating, java.math.BigDecimal totalEarnings,
            java.math.BigDecimal totalSpent, User viewer, boolean applyPrivacy) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.username = user.getUsername();
        this.profileImageUrl = user.getProfileImageUrl();
        this.rating = avgRating != null ? avgRating : 0.0;
        this.bio = user.getProfile() != null ? user.getProfile().getBio() : "";
        this.city = user.getProfile() != null ? user.getProfile().getCity() : "";
        this.state = user.getProfile() != null ? user.getProfile().getState() : "";
        this.totalItemsPosted = totalItemsPosted;
        this.walletBalance = user.getWalletBalance() != null ? user.getWalletBalance() : java.math.BigDecimal.ZERO;
        this.totalEarnings = totalEarnings != null ? totalEarnings : java.math.BigDecimal.ZERO;
        this.totalSpent = totalSpent != null ? totalSpent : java.math.BigDecimal.ZERO;
        this.joinedDate = user.getCreatedAt() != null ? user.getCreatedAt()
                : LocalDateTime.now(java.time.ZoneId.of("Africa/Cairo"));
        this.blocked = user.getBlocked();
        this.verified = user.getVerified();

        // Get privacy settings with defaults
        String visibility = user.getProfileVisibility() != null ? user.getProfileVisibility() : "EVERYONE";
        boolean showContact = user.isShowContactInfo();
        boolean hideAddr = user.isHideAddress();

        this.profileVisibility = visibility;
        this.isRestricted = false;

        // Apply privacy filtering if requested and viewer is not the profile owner
        if (applyPrivacy && (viewer == null || !viewer.getId().equals(user.getId()))) {
            // Check profile visibility
            if ("PRIVATE".equals(visibility)) {
                this.isRestricted = true;
                this.bio = null;
                this.email = null;
                this.phoneNumber = null;
                this.address = null;
            } else if ("VERIFIED_ONLY".equals(visibility)) {
                if (viewer == null || viewer.getVerified() == null || !viewer.getVerified()) {
                    this.isRestricted = true;
                    this.bio = null;
                    this.email = null;
                    this.phoneNumber = null;
                    this.address = null;
                }
            }

            // Apply contact info privacy if not already restricted
            if (!this.isRestricted) {
                if (showContact) {
                    this.email = user.getEmail();
                    this.phoneNumber = user.getPhoneNumber();
                } else {
                    this.email = null;
                    this.phoneNumber = null;
                }

                // Apply address privacy
                if (!hideAddr) {
                    this.address = user.getAddress();
                } else {
                    this.address = null;
                }
            }
        } else {
            // No privacy filtering - show everything (owner viewing own profile or privacy
            // disabled)
            this.email = user.getEmail();
            this.phoneNumber = user.getPhoneNumber();
            this.address = user.getAddress();
        }
    }
}
