package com.agarly.backend.dtos;

import com.agarly.backend.models.Enums.ItemCategory;
import com.agarly.backend.models.Enums.ItemRentalStatus;
import com.agarly.backend.models.Enums.ItemStatus;
import com.agarly.backend.models.Enums.PriceUnit;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SearchCriteria {
    private String keyword;
    private ItemCategory category;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private PriceUnit priceUnit;

    private Double latitude;
    private Double longitude;
    private Double radius;

    private ItemStatus approvalStatus;
    private ItemRentalStatus rentalStatus;
    private String sortBy;          // price, rating, distance, newest
    private String sortDirection;       // asc, desc

}
