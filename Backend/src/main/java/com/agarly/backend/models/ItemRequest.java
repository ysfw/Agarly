package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class ItemRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    private String status; // PENDING, FULFILLED, CANCELLED

    public ItemRequest(String title, String description) {
        this.title = title;
        this.description = description;
        this.status = "PENDING";
    }
}
