package com.agarly.backend.repos;

import com.agarly.backend.models.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Optional<Achievement> findByCode(String code);

    List<Achievement> findByCategory(String category);

    List<Achievement> findByHiddenFalse();
}
