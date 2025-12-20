package com.agarly.backend.models;

import com.agarly.backend.models.Enums.ItemCategory;
import com.agarly.backend.models.Enums.ItemCondition;
import com.agarly.backend.models.Enums.PriceUnit;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Data
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double rating;

    @NotNull
    private String title;
    @NotNull
    @Size(min = 1, max = 1000)
    private String description;
    @NotNull
    @Min(1)
    private BigDecimal pricePerDay;
    @NotNull
    @Enumerated(EnumType.STRING)
    private PriceUnit priceUnit; // "day" or "hour"

    @NotNull
    @Enumerated(EnumType.STRING)
    private ItemCategory category;
    @NotNull
    private String location; // Human readable address
    @NotNull
    @Min(-90)@Max(90)
    private Double latitude;
    @Min(-180)@Max(180)
    private Double longitude;
    
    @ElementCollection
    @Size(max = 5)
    private List<String> imageUrls;

    @NotNull
    @Enumerated(EnumType.STRING)
    @NotNull
    private ItemCondition condition;

    @ManyToOne
    private User owner;

    @ManyToOne
    private User borrower;

    private java.time.LocalDate dueDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    private com.agarly.backend.models.Enums.ItemStatus status;
}
