package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Tracks which achievements a user has earned.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_achievement", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "achievement_id" })
})
public class UserAchievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "achievement_id", nullable = false)
    private Achievement achievement;

    private LocalDateTime earnedAt;

    private int currentProgress; // Current progress towards achievement (for display)

    private boolean notified; // Whether user has been notified about earning this

    @PrePersist
    protected void onCreate() {
        if (earnedAt == null) {
            earnedAt = LocalDateTime.now(ZoneId.of("Africa/Cairo"));
        }
    }
}
