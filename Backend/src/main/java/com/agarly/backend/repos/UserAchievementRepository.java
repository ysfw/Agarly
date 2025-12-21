package com.agarly.backend.repos;

import com.agarly.backend.models.User;
import com.agarly.backend.models.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    List<UserAchievement> findByUser(User user);

    List<UserAchievement> findByUserId(Long userId);

    Optional<UserAchievement> findByUserIdAndAchievementId(Long userId, Long achievementId);

    Optional<UserAchievement> findByUserIdAndAchievementCode(Long userId, String code);

    @Query("SELECT ua FROM UserAchievement ua WHERE ua.user.id = :userId AND ua.notified = false")
    List<UserAchievement> findUnnotifiedByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(ua) FROM UserAchievement ua WHERE ua.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    boolean existsByUserIdAndAchievementCode(Long userId, String code);
}
