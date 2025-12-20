package com.agarly.backend.controllers;

import com.agarly.backend.models.Item;
import com.agarly.backend.models.ItemRequest;
import com.agarly.backend.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private AdminService adminService;

    // ==================== Dashboard Stats ====================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ==================== User Management ====================

    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<String> banUser(@PathVariable Long userId) {
        adminService.banUser(userId);
        return ResponseEntity.ok("User banned successfully");
    }

    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<String> unbanUser(@PathVariable Long userId) {
        adminService.unbanUser(userId);
        return ResponseEntity.ok("User unbanned successfully");
    }

    // ==================== Item (Post) Management ====================

    @GetMapping("/items")
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(adminService.getAllItems());
    }

    @GetMapping("/items/pending")
    public ResponseEntity<List<Item>> getPendingItems() {
        return ResponseEntity.ok(adminService.getPendingItems());
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<Item> getItem(@PathVariable Long id) {
        Item item = adminService.getItem(id);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(item);
    }

    @PutMapping("/items/{id}/approve")
    public ResponseEntity<String> approveItem(@PathVariable Long id) {
        try {
            adminService.approveItem(id);
            return ResponseEntity.ok("Item approved successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/items/{id}/reject")
    public ResponseEntity<String> rejectItem(@PathVariable Long id) {
        try {
            adminService.rejectItem(id);
            return ResponseEntity.ok("Item rejected successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<String> deleteItem(@PathVariable Long id) {
        try {
            adminService.deleteItem(id);
            return ResponseEntity.ok("Item deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== Request Management ====================

    @GetMapping("/requests")
    public ResponseEntity<List<ItemRequest>> getAllRequests() {
        return ResponseEntity.ok(adminService.getAllRequests());
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<List<ItemRequest>> getPendingRequests() {
        return ResponseEntity.ok(adminService.getPendingRequests());
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<ItemRequest> getRequest(@PathVariable Long id) {
        ItemRequest request = adminService.getRequest(id);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(request);
    }

    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<String> approveRequest(@PathVariable Long id) {
        try {
            adminService.approveRequest(id);
            return ResponseEntity.ok("Request approved successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<String> rejectRequest(@PathVariable Long id) {
        try {
            adminService.rejectRequest(id);
            return ResponseEntity.ok("Request rejected successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/requests/{id}")
    public ResponseEntity<String> deleteRequest(@PathVariable Long id) {
        try {
            adminService.deleteRequest(id);
            return ResponseEntity.ok("Request deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
