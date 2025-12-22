package com.agarly.backend.controllers;

import com.agarly.backend.dtos.SearchCriteria;
import com.agarly.backend.models.Enums.ItemCategory;
import com.agarly.backend.models.Item;
import com.agarly.backend.services.SearchService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
public class SearchController {
    @Autowired
    private SearchService searchService;

    @PostMapping("/search")
    public ResponseEntity<List<Item>> search(@Valid @RequestBody SearchCriteria criteria) {
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
