package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an achievement that users can earn.
 * Achievements are predefined and tracked based on user activity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "achievement")
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // Unique identifier like "GOOD_NEIGHBOR", "TOP_RATED"

    @Column(nullable = false)
    private String name; // Display name like "Good Neighbor"

    @Column(nullable = false)
    private String description; // Description like "10+ successful shares"

    @Column(nullable = false)
    private String iconName; // Icon identifier for frontend (e.g., "heart", "award")

    @Column(nullable = false)
    private String iconColor; // Color class (e.g., "red", "yellow", "green", "blue")

    @Column(nullable = false)
    private String category; // Category: "sharing", "borrowing", "rating", "engagement"

    private int requiredCount; // Number required to unlock (e.g., 10 for "10+ shares")

    private double requiredValue; // Value threshold (e.g., 4.5 for rating achievements)

    private int points; // Points awarded for earning this achievement

    private boolean hidden; // Whether to show progress before unlocking
}
