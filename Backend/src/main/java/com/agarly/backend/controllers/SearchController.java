package com.agarly.backend.controllers;

import com.agarly.backend.services.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/items")
public class SearchController {
    @Autowired
    private SearchService searchService;

    @GetMapping("/search")
    public void search() {
        searchService.searchItems();
    }

    @GetMapping("/feed")
    public void getFeed() {
        // Get feed logic
    }
}
