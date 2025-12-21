package com.agarly.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class ItemRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;


        this.title = title;
        this.description = description;
    }
}
