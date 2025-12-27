package com.agarly.backend.controllers;

import com.agarly.backend.models.Item;
import com.agarly.backend.models.ItemRequest;
import com.agarly.backend.models.User;
import com.agarly.backend.dtos.PublicUserProfileDTO;
import com.agarly.backend.repos.ItemRepository;
import com.agarly.backend.models.SupportTicket;
import com.agarly.backend.services.AdminService;
import com.agarly.backend.services.SupportTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {
    @Autowired
    private AdminService adminService;
    @Autowired
    private SupportTicketService ticketService;

    @Autowired
    private ItemRepository itemRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<PublicUserProfileDTO>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        // Convert to DTO to avoid exposing passwords/OTPs
        List<PublicUserProfileDTO> userDTOs = users.stream()
                .map(user -> {
                    Long itemCount = itemRepository.countByOwner(user);
                    return new PublicUserProfileDTO(user, itemCount);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<PublicUserProfileDTO>> searchUsers(@RequestParam String q) {
        List<User> users = adminService.searchUsers(q);
        // Convert to DTO
        List<PublicUserProfileDTO> userDTOs = users.stream()
                .map(user -> {
                    Long itemCount = itemRepository.countByOwner(user);
                    return new PublicUserProfileDTO(user, itemCount);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

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

    @GetMapping("/tickets/{id}")
    public ResponseEntity<SupportTicket> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    @PutMapping("/tickets/{id}/close")
    public ResponseEntity<SupportTicket> closeTicket(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ticketService.closeTicket(id));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/tickets/open")
    public ResponseEntity<List<SupportTicket>> getOpenTickets() {
        return ResponseEntity.ok(ticketService.getOpenTickets());
    }

    @GetMapping("/tickets/closed")
    public ResponseEntity<List<SupportTicket>> getClosedTickets() {
        return ResponseEntity.ok(ticketService.getClosedTickets());
    }

    @GetMapping("/tickets/pending")
    public ResponseEntity<List<SupportTicket>> getPendingTickets() {
        return ResponseEntity.ok(ticketService.getPendingTickets());
    }

    @PutMapping("/tickets/{id}/reopen")
    public ResponseEntity<SupportTicket> reopenTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.reopenTicket(id));
    }
}
