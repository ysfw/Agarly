package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Data
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double rating;

    private String title;
    private String description;
    private BigDecimal pricePerDay;
    private String priceUnit; // "day" or "hour"
    private String category;
    private String location; // Human readable address
    private Double latitude;
    private Double longitude;
    
    @ElementCollection
    private List<String> imageUrls;

    @ManyToOne
    private User owner;
}
