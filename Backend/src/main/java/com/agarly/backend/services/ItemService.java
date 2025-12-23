package com.agarly.backend.services;

import com.agarly.backend.dtos.UpdateItemRequest;
import com.agarly.backend.models.Enums.ItemCategory;
import com.agarly.backend.models.Item;
import com.agarly.backend.repos.ItemRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import com.agarly.backend.models.SSE;
import com.agarly.backend.models.User;
import org.springframework.security.access.AccessDeniedException;

@Service
public class ItemService {
    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private EventService eventService;

    @Valid
    public Long createItem(Item item, User owner) {
        item.setOwner(owner);
        item.setStatus(com.agarly.backend.models.Enums.ItemStatus.PENDING);
        item.setRentalStatus(com.agarly.backend.models.Enums.ItemRentalStatus.AVAILABLE);
        itemRepository.save(item);

        // Notify admins that a new item needs approval
        List<String> adminRecipients = new ArrayList<>();
        adminRecipients.add("admin"); // Admins should listen for this
        eventService.publishEvent(new SSE("ITEM_CREATED", adminRecipients, item.getId()));

        return item.getId();
    }

    /**
     * Edit an existing item. Only updates the editable fields from the DTO.
     * Preserves system fields like status, owner, borrower, rating, etc.
     */
    @Valid
    public void editItem(Long id, UpdateItemRequest request, User currentUser) {
        Item existingItem = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (!existingItem.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not the owner of this item");
        }

        // Only update editable fields - preserve all system fields
        if (request.getTitle() != null) {
            existingItem.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            existingItem.setDescription(request.getDescription());
        }
        if (request.getPricePerDay() != null) {
            existingItem.setPricePerDay(request.getPricePerDay());
        }
        if (request.getPriceUnit() != null) {
            existingItem.setPriceUnit(request.getPriceUnit());
        }
        if (request.getCategory() != null) {
            existingItem.setCategory(request.getCategory());
        }
        if (request.getLocation() != null) {
            existingItem.setLocation(request.getLocation());
        }
        if (request.getLatitude() != null) {
            existingItem.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            existingItem.setLongitude(request.getLongitude());
        }
        if (request.getImageUrls() != null) {
            existingItem.setImageUrls(request.getImageUrls());
        }
        if (request.getCondition() != null) {
            existingItem.setCondition(request.getCondition());
        }

        itemRepository.save(existingItem);
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

    public List<Item> getPendingItemsByOwner(User owner) {
        return itemRepository.findByOwnerAndStatus(owner, com.agarly.backend.models.Enums.ItemStatus.PENDING);
    }

    public List<Item> getApprovedItems() {
        return itemRepository.findByStatusAndRentalStatus(
                com.agarly.backend.models.Enums.ItemStatus.APPROVED,
                com.agarly.backend.models.Enums.ItemRentalStatus.AVAILABLE);
    }

    public void lendItem(Long id, User borrower, java.time.LocalDate dueDate) {
        Item item = itemRepository.findById(id).orElse(null);
        if (item != null) {
            item.setBorrower(borrower);
            item.setDueDate(dueDate);
            item.setRentalStatus(com.agarly.backend.models.Enums.ItemRentalStatus.BORROWED);
            itemRepository.save(item);
        }
    }

    public void returnItem(Long id) {
        Item item = itemRepository.findById(id).orElse(null);
        if (item != null) {
            item.setBorrower(null);
            item.setDueDate(null);
            item.setRentalStatus(com.agarly.backend.models.Enums.ItemRentalStatus.AVAILABLE);
            itemRepository.save(item);
        }
    }

}
