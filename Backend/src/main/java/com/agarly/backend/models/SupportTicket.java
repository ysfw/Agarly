package com.agarly.backend.models;

import com.agarly.backend.models.Enums.TicketStatus;
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

    @Enumerated(EnumType.STRING)
    private TicketStatus status; // OPEN, CLOSED, IN_PROGRESS
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("Africa/Cairo"));

    @ManyToOne
    private User createdBy;
}
