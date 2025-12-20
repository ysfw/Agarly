package com.agarly.backend.models;

import com.agarly.backend.models.Enums.ReviewTargetType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating;
//    private String comment;

    @ManyToOne
    private User reviewer;

    @ManyToOne
    private Item targetItem; // Or User targetUser, depending on requirements
    @ManyToOne
    private User targetUser;

    @Enumerated(EnumType.STRING)
    private ReviewTargetType reviewTarget;
}
