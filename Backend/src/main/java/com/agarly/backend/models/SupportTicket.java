package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Data
public class SupportTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;
    private String message;
    private String status; // OPEN, CLOSED, IN_PROGRESS
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("Africa/Cairo"));

    @ManyToOne
    private User user;
}
