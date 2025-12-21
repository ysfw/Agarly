package com.agarly.backend.services;

import com.agarly.backend.dtos.AchievementDTO;
import com.agarly.backend.models.Achievement;
import com.agarly.backend.models.User;
import com.agarly.backend.models.UserAchievement;
import com.agarly.backend.repos.AchievementRepository;
import com.agarly.backend.repos.UserAchievementRepository;
import com.agarly.backend.repos.UserRepository;
import com.agarly.backend.repos.ItemRepository;
import com.agarly.backend.repos.ReviewRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing achievements and tracking user progress
 */
@Service
public class AchievementService {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    /**
     * Initialize default achievements on startup
     */
    @PostConstruct
    @Transactional
    public void initializeAchievements() {
        // Only initialize if no achievements exist
        if (achievementRepository.count() > 0) {
            return;
        }

        List<Achievement> defaultAchievements = Arrays.asList(
                // Sharing achievements
                Achievement.builder()
                        .code("FIRST_SHARE")
                        .name("First Share")
                        .description("Share your first item")
                        .iconName("gift")
                        .iconColor("purple")
                        .category("sharing")
                        .requiredCount(1)
                        .points(10)
                        .hidden(false)
                        .build(),

                Achievement.builder()
                        .code("GOOD_NEIGHBOR")
                        .name("Good Neighbor")
                        .description("10+ successful shares")
                        .iconName("heart")
                        .iconColor("red")
                        .category("sharing")
                        .requiredCount(10)
                        .points(50)
                        .hidden(false)
                        .build(),

                Achievement.builder()
                        .code("SUPER_SHARER")
                        .name("Super Sharer")
                        .description("50+ items shared")
                        .iconName("sparkles")
                        .iconColor("yellow")
                        .category("sharing")
                        .requiredCount(50)
                        .points(200)
                        .hidden(false)
                        .build(),

                // Borrowing achievements
                Achievement.builder()
                        .code("FIRST_BORROW")
                        .name("First Borrow")
                        .description("Borrow your first item")
                        .iconName("hand")
                        .iconColor("blue")
                        .category("borrowing")
                        .requiredCount(1)
                        .points(10)
                        .hidden(false)
                        .build(),

                Achievement.builder()
                        .code("ECO_WARRIOR")
                        .name("Eco Warrior")
                        .description("20+ items borrowed")
                        .iconName("leaf")
                        .iconColor("green")
                        .category("borrowing")
                        .requiredCount(20)
                        .points(100)
                        .hidden(false)
                        .build(),

                Achievement.builder()
                        .code("COMMUNITY_CHAMPION")
                        .name("Community Champion")
                        .description("100+ items borrowed")
                        .iconName("trophy")
                        .iconColor("gold")
                        .category("borrowing")
                        .requiredCount(100)
                        .points(500)
                        .hidden(false)
                        .build(),

                // Rating achievements
                Achievement.builder()
                        .code("TOP_RATED")
                        .name("Top Rated")
                        .description("4.5+ average rating")
                        .iconName("award")
                        .iconColor("yellow")
                        .category("rating")
                        .requiredCount(5) // Minimum reviews required
                        .requiredValue(4.5)
                        .points(75)
                        .hidden(false)
                        .build(),

                Achievement.builder()
                        .code("FIVE_STAR")
                        .name("Five Star")
                        .description("Perfect 5.0 rating")
                        .iconName("star")
                        .iconColor("gold")
                        .category("rating")
                        .requiredCount(10)
                        .requiredValue(5.0)
                        .points(150)
                        .hidden(false)
                        .build(),

                // Engagement achievements
                Achievement.builder()
                        .code("QUICK_RESPONDER")
                        .name("Quick Responder")
                        .description("Fast reply rate")
                        .iconName("message-circle")
                        .iconColor("blue")
                        .category("engagement")
                        .requiredCount(20)
                        .points(50)
                        .hidden(false)
                        .build(),

                Achievement.builder()
                        .code("VERIFIED")
                        .name("Verified Member")
                        .description("Complete profile verification")
                        .iconName("shield-check")
                        .iconColor("green")
                        .category("engagement")
                        .requiredCount(1)
                        .points(25)
                        .hidden(false)
                        .build(),

                // Special achievements
                Achievement.builder()
                        .code("EARLY_ADOPTER")
                        .name("Early Adopter")
                        .description("Joined in first 100 users")
                        .iconName("rocket")
                        .iconColor("orange")
                        .category("special")
                        .requiredCount(1)
                        .points(100)
                        .hidden(true)
                        .build(),

                Achievement.builder()
                        .code("PERFECT_MONTH")
                        .name("Perfect Month")
                        .description("5+ transactions with no issues")
                        .iconName("calendar-check")
                        .iconColor("teal")
                        .category("special")
                        .requiredCount(5)
                        .points(75)
                        .hidden(false)
                        .build());

        achievementRepository.saveAll(defaultAchievements);
    }

    /**
     * Get all achievements for a user with their earned status
     */
    public List<AchievementDTO> getUserAchievements(Long userId) {
        // Get all achievements
        List<Achievement> allAchievements = achievementRepository.findByHiddenFalse();

        // Get user's earned achievements
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
        Map<Long, UserAchievement> earnedMap = userAchievements.stream()
                .collect(Collectors.toMap(ua -> ua.getAchievement().getId(), ua -> ua));

        // Get user stats for progress calculation
        User user = userRepository.findById(userId).orElse(null);
        Map<String, Integer> progressMap = calculateProgress(userId);

        List<AchievementDTO> result = new ArrayList<>();
        for (Achievement achievement : allAchievements) {
            if (earnedMap.containsKey(achievement.getId())) {
                result.add(AchievementDTO.fromUserAchievement(earnedMap.get(achievement.getId())));
            } else {
                AchievementDTO dto = AchievementDTO.fromAchievement(achievement);
                // Add progress info
                Integer progress = progressMap.getOrDefault(achievement.getCode(), 0);
                dto.setCurrentProgress(progress);
                if (achievement.getRequiredCount() > 0) {
                    dto.setProgressPercentage(Math.min(100, (progress * 100) / achievement.getRequiredCount()));
                }
                result.add(dto);
            }
        }

        // Sort: earned first, then by points
        result.sort((a, b) -> {
            if (a.isEarned() != b.isEarned()) {
                return a.isEarned() ? -1 : 1;
            }
            return Integer.compare(b.getPoints(), a.getPoints());
        });

        return result;
    }

    /**
     * Get only earned achievements for a user
     */
    public List<AchievementDTO> getEarnedAchievements(Long userId) {
        return userAchievementRepository.findByUserId(userId).stream()
                .map(AchievementDTO::fromUserAchievement)
                .collect(Collectors.toList());
    }

    /**
     * Calculate current progress for each achievement type
     */
    private Map<String, Integer> calculateProgress(Long userId) {
        Map<String, Integer> progress = new HashMap<>();

        // Count items shared
        long itemsShared = itemRepository.countByOwnerId(userId);
        progress.put("FIRST_SHARE", (int) Math.min(itemsShared, 1));
        progress.put("GOOD_NEIGHBOR", (int) itemsShared);
        progress.put("SUPER_SHARER", (int) itemsShared);

        // For borrowing, we'd need a booking repository
        // Using placeholder for now
        progress.put("FIRST_BORROW", 0);
        progress.put("ECO_WARRIOR", 0);
        progress.put("COMMUNITY_CHAMPION", 0);

        // Rating progress
        Double avgRating = reviewRepository.getAverageRatingForUser(userId);
        long reviewCount = reviewRepository.countByReviewedUserId(userId);
        if (avgRating != null && reviewCount >= 5) {
            progress.put("TOP_RATED", avgRating >= 4.5 ? 5 : (int) reviewCount);
            progress.put("FIVE_STAR", avgRating >= 5.0 ? 10 : (int) reviewCount);
        }

        // Verification
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && Boolean.TRUE.equals(user.getVerified())) {
            progress.put("VERIFIED", 1);
        }

        return progress;
    }

    /**
     * Check and award achievements for a user based on current stats
     */
    @Transactional
    public List<AchievementDTO> checkAndAwardAchievements(Long userId) {
        List<AchievementDTO> newlyEarned = new ArrayList<>();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return newlyEarned;

        // Get all achievements
        List<Achievement> allAchievements = achievementRepository.findAll();
        Map<String, Integer> progress = calculateProgress(userId);

        for (Achievement achievement : allAchievements) {
            // Skip if already earned
            if (userAchievementRepository.existsByUserIdAndAchievementCode(userId, achievement.getCode())) {
                continue;
            }

            boolean earned = false;
            int currentProgress = progress.getOrDefault(achievement.getCode(), 0);

            // Check based on category
            switch (achievement.getCode()) {
                case "FIRST_SHARE":
                case "GOOD_NEIGHBOR":
                case "SUPER_SHARER":
                case "FIRST_BORROW":
                case "ECO_WARRIOR":
                case "COMMUNITY_CHAMPION":
                case "QUICK_RESPONDER":
                case "PERFECT_MONTH":
                    earned = currentProgress >= achievement.getRequiredCount();
                    break;

                case "TOP_RATED":
                case "FIVE_STAR":
                    Double avgRating = reviewRepository.getAverageRatingForUser(userId);
                    long reviewCount = reviewRepository.countByReviewedUserId(userId);
                    earned = avgRating != null &&
                            avgRating >= achievement.getRequiredValue() &&
                            reviewCount >= achievement.getRequiredCount();
                    break;

                case "VERIFIED":
                    earned = Boolean.TRUE.equals(user.getVerified());
                    break;

                case "EARLY_ADOPTER":
                    earned = user.getId() <= 100;
                    break;
            }

            if (earned) {
                UserAchievement ua = UserAchievement.builder()
                        .user(user)
                        .achievement(achievement)
                        .currentProgress(currentProgress)
                        .notified(false)
                        .build();
                userAchievementRepository.save(ua);
                newlyEarned.add(AchievementDTO.fromUserAchievement(ua));
            }
        }

        return newlyEarned;
    }

    /**
     * Get unnotified achievements and mark them as notified
     */
    @Transactional
    public List<AchievementDTO> getAndMarkNotified(Long userId) {
        List<UserAchievement> unnotified = userAchievementRepository.findUnnotifiedByUserId(userId);
        List<AchievementDTO> result = unnotified.stream()
                .map(AchievementDTO::fromUserAchievement)
                .collect(Collectors.toList());

        // Mark as notified
        for (UserAchievement ua : unnotified) {
            ua.setNotified(true);
            userAchievementRepository.save(ua);
        }

        return result;
    }

    /**
     * Get total achievement points for a user
     */
    public int getTotalPoints(Long userId) {
        return userAchievementRepository.findByUserId(userId).stream()
                .mapToInt(ua -> ua.getAchievement().getPoints())
                .sum();
    }
}
