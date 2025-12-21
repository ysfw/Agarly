package com.agarly.backend.dtos;

import com.agarly.backend.models.Achievement;
import com.agarly.backend.models.UserAchievement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for returning achievement data to frontend
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String iconName;
    private String iconColor;
    private String category;
    private int requiredCount;
    private int points;
    private boolean earned;
    private LocalDateTime earnedAt;
    private int currentProgress;
    private int progressPercentage;

    public static AchievementDTO fromAchievement(Achievement achievement) {
        return AchievementDTO.builder()
                .id(achievement.getId())
                .code(achievement.getCode())
                .name(achievement.getName())
                .description(achievement.getDescription())
                .iconName(achievement.getIconName())
                .iconColor(achievement.getIconColor())
                .category(achievement.getCategory())
                .requiredCount(achievement.getRequiredCount())
                .points(achievement.getPoints())
                .earned(false)
                .currentProgress(0)
                .progressPercentage(0)
                .build();
    }

    public static AchievementDTO fromUserAchievement(UserAchievement ua) {
        Achievement achievement = ua.getAchievement();
        int progress = ua.getCurrentProgress();
        int required = achievement.getRequiredCount();
        int percentage = required > 0 ? Math.min(100, (progress * 100) / required) : 100;

        return AchievementDTO.builder()
                .id(achievement.getId())
                .code(achievement.getCode())
                .name(achievement.getName())
                .description(achievement.getDescription())
                .iconName(achievement.getIconName())
                .iconColor(achievement.getIconColor())
                .category(achievement.getCategory())
                .requiredCount(required)
                .points(achievement.getPoints())
                .earned(true)
                .earnedAt(ua.getEarnedAt())
                .currentProgress(progress)
                .progressPercentage(percentage)
                .build();
    }
}
