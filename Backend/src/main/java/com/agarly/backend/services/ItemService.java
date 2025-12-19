package com.agarly.backend.services;

import com.agarly.backend.repos.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ItemService {
    @Autowired
    private ItemRepository itemRepository;

    public void createItem() {
        // Business logic for item creation
    }

    public void validateItem() {
        // Validation logic
    }
}
