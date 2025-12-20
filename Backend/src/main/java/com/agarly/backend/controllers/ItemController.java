package com.agarly.backend.controllers;

import com.agarly.backend.models.Enums.ItemCategory;
import com.agarly.backend.models.Item;
import com.agarly.backend.models.User;
import com.agarly.backend.services.ItemService;
import com.agarly.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    @Autowired
    private ItemService itemService;
    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        String username = authentication.getName();
        return userService.findByUsername(username); // Assuming email is the principal
    }

    @PostMapping
    public ResponseEntity<Long> createItem(@RequestBody Item item) {
        Long id = itemService.createItem(item, getCurrentUser());
        return new ResponseEntity<>(id, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> editItem(@PathVariable Long id, @RequestBody Item item) {
        itemService.editItem(id, item, getCurrentUser());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id, getCurrentUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Item>> getItemsByCategory(@PathVariable ItemCategory category) {
        return ResponseEntity.ok(itemService.getItemsByCategory(category));
    }

    @GetMapping("/lent")
    public ResponseEntity<List<Item>> getMyLentItems() {
        return ResponseEntity.ok(itemService.getItemsByOwner(getCurrentUser()));
    }

    @GetMapping("/borrowed")
    public ResponseEntity<List<Item>> getMyBorrowedItems() {
        return ResponseEntity.ok(itemService.getBorrowedItems(getCurrentUser()));
    }

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Item>> getMyPendingItems() {
        return ResponseEntity.ok(itemService.getPendingItemsByOwner(getCurrentUser()));
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Item>> getApprovedItems() {
        return ResponseEntity.ok(itemService.getApprovedItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        Item item = itemService.getItem(id);
        if (item != null) {
            return ResponseEntity.ok(item);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/lend")
    public ResponseEntity<Void> lendItem(@PathVariable Long id, @RequestParam String borrowerEmail,
            @RequestParam(required = false) java.time.LocalDate dueDate) {
        User borrower = userService.findByEmail(borrowerEmail);
        if (borrower == null) {
            return ResponseEntity.badRequest().build();
        }
        itemService.lendItem(id, borrower, dueDate);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<Void> returnItem(@PathVariable Long id) {
        itemService.returnItem(id);
        return ResponseEntity.ok().build();
    }
}
