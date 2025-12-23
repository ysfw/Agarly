package com.agarly.backend.dtos;

import com.agarly.backend.models.Enums.ItemCategory;
import com.agarly.backend.models.Enums.ItemCondition;
import com.agarly.backend.models.Enums.PriceUnit;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for updating an existing item.
 * Only contains fields that the owner is allowed to edit.
 * Other fields like status, owner, borrower, etc. are preserved.
 */
@Data
public class UpdateItemRequest {
    private String title;
    private String description;
    private BigDecimal pricePerDay;
    private PriceUnit priceUnit;
    private ItemCategory category;
    private String location;
    private Double latitude;
    private Double longitude;
    private List<String> imageUrls;
    private ItemCondition condition;
}
