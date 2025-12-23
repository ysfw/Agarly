package com.agarly.backend.models;

import com.agarly.backend.models.Enums.AuthProvider;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter
@Setter
@Entity
@Table(name = "\"user\"")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    @Column(nullable = true)
    private String password;
    private String email;
    private String phoneNumber;
    private String firstName;
    private String lastName;
    private String address;
    private Boolean activated;
    private Boolean blocked;
    private double rating;
    @Column(columnDefinition = "TEXT")
    private String profileImageUrl;
    private String otp;
    private Boolean verified;
    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private UserProfile profile;

    @Transient
    private java.math.BigDecimal totalEarnings;

    @Transient
    private java.math.BigDecimal totalSpent;

    private BigDecimal walletBalance = BigDecimal.ZERO;

    // Notification preferences - push only via SSE
    private boolean pushNotificationsEnabled = true;

    // Privacy settings
    private String profileVisibility = "EVERYONE"; // EVERYONE, VERIFIED_ONLY, PRIVATE
    private boolean showContactInfo = false;
    private boolean hideAddress = true;
    private boolean onlyVerifiedMembers = true;

    // Account status
    private boolean banned = false;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now(ZoneId.of("Africa/Cairo"));
        }
    }

    public User() {
        this.profile = new UserProfile();
        this.profile.setUser(this);
        this.profile.setBio("");
        this.profile.setCity("");
        this.profile.setState("");
        this.profile.setZipCode("");
        this.blocked = false;
    }

}
