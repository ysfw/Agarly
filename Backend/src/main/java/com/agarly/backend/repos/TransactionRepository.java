package com.agarly.backend.repos;

import com.agarly.backend.models.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserEmail(String email);

    Page<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
