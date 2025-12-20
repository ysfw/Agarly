package com.agarly.backend.models;

import com.agarly.backend.models.Enums.ItemCategory;
import com.agarly.backend.models.Enums.ItemStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "item_request")
public class ItemRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private ItemCategory category;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.PENDING;

    private LocalDate startDate;
    private LocalDate endDate;

    private String urgency; // "flexible", "soon", "urgent"

    private LocalDateTime createdAt = LocalDateTime.now();

    public ItemRequest() {
    }

    public ItemRequest(String title, String description, User requester) {
        this.title = title;
        this.description = description;
        this.requester = requester;
        this.status = ItemStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }
}
