package com.agarly.backend.services;

import com.agarly.backend.models.Enums.TicketStatus;
import com.agarly.backend.models.Item;
import com.agarly.backend.models.ItemRequest;
import com.agarly.backend.models.User;
import com.agarly.backend.models.Enums.ItemStatus;
import com.agarly.backend.repos.ItemRepository;
import com.agarly.backend.repos.ItemRequestRepository;
import com.agarly.backend.repos.SupportTicketRepository;
import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ItemRequestRepository itemRequestRepository;

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    // ==================== User Management ====================

    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(Boolean.TRUE);
        userRepository.save(user);
    }

    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBlocked(Boolean.FALSE);
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> searchUsers(String query) {
        query = query.toLowerCase();
        final String searchQuery = query;
        return userRepository.findAll().stream()
                .filter(user -> (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(searchQuery))
                        ||
                        (user.getLastName() != null && user.getLastName().toLowerCase().contains(searchQuery)) ||
                        (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchQuery)))
                .toList();
    }

    // ==================== Dashboard Stats ====================

    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("pendingPosts", Long.valueOf(itemRepository.findByStatus(ItemStatus.PENDING).stream().count()));
        stats.put("pendingRequests", Long.valueOf(itemRequestRepository.countByStatus(ItemStatus.PENDING)));
        stats.put("openTickets", Long.valueOf(supportTicketRepository.countByStatus(TicketStatus.OPEN)));
        stats.put("totalPosts", Long.valueOf(itemRepository.count()));
        stats.put("totalRequests", Long.valueOf(itemRequestRepository.count()));
        stats.put("totalTickets", Long.valueOf(supportTicketRepository.count()));
        return stats;
    }

    // ==================== Item (Post) Management ====================

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public List<Item> getPendingItems() {
        return itemRepository.findByStatus(ItemStatus.PENDING);
    }

    public Item getItem(Long id) {
        return itemRepository.findById(id).orElse(null);
    }

    public void approveItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setStatus(ItemStatus.APPROVED);
        itemRepository.save(item);
    }

    public void rejectItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setStatus(ItemStatus.REJECTED);
        itemRepository.save(item);
    }

    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item not found");
        }
        itemRepository.deleteById(id);
    }

    // ==================== Request Management ====================

    public List<ItemRequest> getAllRequests() {
        return itemRequestRepository.findAll();
    }

    public List<ItemRequest> getPendingRequests() {
        return itemRequestRepository.findByStatus(ItemStatus.PENDING);
    }

    public ItemRequest getRequest(Long id) {
        return itemRequestRepository.findById(id).orElse(null);
    }

    public void approveRequest(Long id) {
        ItemRequest request = itemRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(ItemStatus.APPROVED);
        itemRequestRepository.save(request);
    }

    public void rejectRequest(Long id) {
        ItemRequest request = itemRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(ItemStatus.REJECTED);
        itemRequestRepository.save(request);
    }

    public void deleteRequest(Long id) {
        if (!itemRequestRepository.existsById(id)) {
            throw new RuntimeException("Request not found");
        }
        itemRequestRepository.deleteById(id);
    }

    public ItemRequest createRequest(ItemRequest request) {
        request.setStatus(ItemStatus.PENDING);
        return itemRequestRepository.save(request);
    }
}
