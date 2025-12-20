package com.agarly.backend.services;

import com.agarly.backend.models.Enums.ItemCategory;
import com.agarly.backend.models.Item;
import com.agarly.backend.repos.ItemRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.agarly.backend.models.User;
import org.springframework.security.access.AccessDeniedException;

@Service
public class ItemService {
    @Autowired
    private ItemRepository itemRepository;

    @Valid
    public Long createItem(Item item, User owner) {
        item.setOwner(owner);
        item.setStatus(com.agarly.backend.models.Enums.ItemStatus.PENDING);
        itemRepository.save(item);
        return item.getId();
    }

    @Valid
    public void editItem(Long id, Item item, User currentUser) {
        Item existingItem = itemRepository.findById(id).orElse(null);
        if (existingItem != null) {
            if (!existingItem.getOwner().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You are not the owner of this item");
            }
            item.setId(id);
            item.setOwner(currentUser); // Ensure owner doesn't change
            itemRepository.save(item);
        }
    }

    @Valid
    public void deleteItem(Long id, User currentUser) {
        Item existingItem = itemRepository.findById(id).orElse(null);
        if (existingItem != null) {
            if (!existingItem.getOwner().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You are not the owner of this item");
            }
            itemRepository.deleteById(id);
        }
    }

    @Valid
    public Item getItem(Long id) {
        return itemRepository.findById(id).orElse(null);
    }

    @Valid
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }
    
    @Valid
    public List<Item> getItemsByCategory(ItemCategory category) {
        return itemRepository.findByCategory(category);
    }

    public List<Item> getItemsByOwner(User owner) {
        return itemRepository.findByOwner(owner);
    }

    public List<Item> getBorrowedItems(User borrower) {
        return itemRepository.findByBorrower(borrower);
    }

    public void lendItem(Long id, User borrower, java.time.LocalDate dueDate) {
        Item item = itemRepository.findById(id).orElse(null);
        if (item != null) {
            item.setBorrower(borrower);
            item.setDueDate(dueDate);
            itemRepository.save(item);
        }
    }

    public void returnItem(Long id) {
        Item item = itemRepository.findById(id).orElse(null);
        if (item != null) {
            item.setBorrower(null);
            item.setDueDate(null);
            itemRepository.save(item);
        }
    }

}
