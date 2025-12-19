package com.agarly.backend.controllers;

import com.agarly.backend.services.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/items")
public class ItemController {
    @Autowired
    private ItemService itemService;

    @PostMapping
    public void createItem() {
        itemService.createItem();
    }

    @PutMapping("/{id}")
    public void updateItem(@PathVariable Long id) {
        // Update logic
    }

    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        // Delete logic
    }
}
