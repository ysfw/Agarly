package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal amount;
    private String type; // e.g., CREDIT, DEBIT
    private String status; // e.g., PENDING, COMPLETED, FAILED
    private LocalDateTime timestamp;

    @ManyToOne
    private User user;
}
