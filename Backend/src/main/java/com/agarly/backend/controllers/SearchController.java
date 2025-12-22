package com.agarly.backend.controllers;

import com.agarly.backend.dtos.SearchCriteria;
import com.agarly.backend.models.Enums.ItemCategory;
import com.agarly.backend.models.Enums.ItemRentalStatus;
import com.agarly.backend.models.Enums.ItemStatus;
import com.agarly.backend.models.Enums.PriceUnit;
import com.agarly.backend.models.Item;
import com.agarly.backend.services.SearchService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/items")
public class SearchController {
    @Autowired
    private SearchService searchService;

    @GetMapping("/search")
    public ResponseEntity<List<Item>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ItemCategory category,

            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) PriceUnit priceUnit,

            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double radius,

            @RequestParam(required = false) ItemStatus approvalStatus,
            @RequestParam(required = false) ItemRentalStatus rentalStatus,

            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        SearchCriteria criteria = new SearchCriteria();
        criteria.setKeyword(keyword);
        criteria.setCategory(category);
        criteria.setMinPrice(minPrice);
        criteria.setMaxPrice(maxPrice);
        criteria.setPriceUnit(priceUnit);
        criteria.setLatitude(latitude);
        criteria.setLongitude(longitude);
        criteria.setRadius(radius);
        criteria.setApprovalStatus(approvalStatus);
        criteria.setRentalStatus(rentalStatus);
        criteria.setSortBy(sortBy);
        criteria.setSortDirection(sortDirection);

        return ResponseEntity.ok(searchService.searchItems(criteria));
    }


    @GetMapping("/category/{category}")
    public List<Item> searchByCategory(@PathVariable ItemCategory category) {
        SearchCriteria criteria = new SearchCriteria();
        criteria.setCategory(category);
        return searchService.searchItems(criteria);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<Item>> getFeed() {
        return ResponseEntity.ok(searchService.getFeed());
    }
}
