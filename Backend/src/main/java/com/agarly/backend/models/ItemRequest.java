package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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
    
    private String category; // e.g., "Tools", "Sports", "Cleaning"
    private String urgency; // URGENT, SOON, FLEXIBLE

    @OneToMany(mappedBy = "itemRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Offer> offers = new ArrayList<>();

    @Column(name = "borrower_user_id")
    private Long borrowerUserId;

    public ItemRequest(String title, String description) {
        this.title = title;
        this.description = description;
        this.status = "PENDING";
        this.urgency = "FLEXIBLE";
    }
}
