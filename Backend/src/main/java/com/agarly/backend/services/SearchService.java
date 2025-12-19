package com.agarly.backend.services;

import com.agarly.backend.repos.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SearchService {
    @Autowired
    private ItemRepository itemRepository;

    public void searchItems() {
        // Implements specification-based filtering
    }
}
