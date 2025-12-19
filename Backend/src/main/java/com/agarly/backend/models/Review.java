package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating;
    private String comment;

    @ManyToOne
    private User reviewer;

    @ManyToOne
    private Item item; // Or User targetUser, depending on requirements
}
