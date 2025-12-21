package com.agarly.backend.controllers;

import com.agarly.backend.dtos.AchievementDTO;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.services.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    @Autowired
    private AchievementService achievementService;

    /**
     * Get all achievements for the current user with earned status and progress
     */
    @GetMapping
    public ResponseEntity<List<AchievementDTO>> getUserAchievements(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(achievementService.getUserAchievements(principal.getId()));
    }

    /**
     * Get only earned achievements for the current user
     */
    @GetMapping("/earned")
    public ResponseEntity<List<AchievementDTO>> getEarnedAchievements(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(achievementService.getEarnedAchievements(principal.getId()));
    }

    /**
     * Get achievements for a specific user (public profile)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AchievementDTO>> getUserAchievementsById(@PathVariable Long userId) {
        return ResponseEntity.ok(achievementService.getEarnedAchievements(userId));
    }

    /**
     * Check and award any new achievements for the current user
     */
    @PostMapping("/check")
    public ResponseEntity<List<AchievementDTO>> checkAchievements(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(achievementService.checkAndAwardAchievements(principal.getId()));
    }

    /**
     * Get unnotified achievements and mark them as notified
     */
    @GetMapping("/notifications")
    public ResponseEntity<List<AchievementDTO>> getAchievementNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(achievementService.getAndMarkNotified(principal.getId()));
    }

    /**
     * Get total achievement points for the current user
     */
    @GetMapping("/points")
    public ResponseEntity<Map<String, Integer>> getTotalPoints(@AuthenticationPrincipal UserPrincipal principal) {
        int points = achievementService.getTotalPoints(principal.getId());
        return ResponseEntity.ok(Map.of("totalPoints", points));
    }
}
