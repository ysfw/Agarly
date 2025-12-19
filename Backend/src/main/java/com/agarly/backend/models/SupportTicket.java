package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class SupportTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;
    private String message;
    private String status; // OPEN, CLOSED, IN_PROGRESS
    private LocalDateTime createdAt;

    @ManyToOne
    private User user;
}
