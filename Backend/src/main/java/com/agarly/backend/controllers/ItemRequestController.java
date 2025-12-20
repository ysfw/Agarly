package com.agarly.backend.controllers;

import com.agarly.backend.models.ItemRequest;
import com.agarly.backend.models.User;
import com.agarly.backend.models.Enums.ItemStatus;
import com.agarly.backend.repos.ItemRequestRepository;
import com.agarly.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class ItemRequestController {

    @Autowired
    private ItemRequestRepository itemRequestRepository;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<ItemRequest>> getAllApprovedRequests() {
        // Return only approved requests for public view
        return ResponseEntity.ok(itemRequestRepository.findByStatus(ItemStatus.APPROVED));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ItemRequest>> getMyRequests(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(itemRequestRepository.findByRequester(user));
    }

    @PostMapping
    public ResponseEntity<ItemRequest> createRequest(@RequestBody ItemRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        request.setRequester(user);
        request.setStatus(ItemStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());

        ItemRequest saved = itemRequestRepository.save(request);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemRequest> getRequest(@PathVariable Long id) {
        return itemRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRequest(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);

        ItemRequest request = itemRequestRepository.findById(id).orElse(null);
        if (request == null) {
            return ResponseEntity.notFound().build();
        }

        // Only allow the requester to delete their own request
        if (!request.getRequester().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to delete this request");
        }

        itemRequestRepository.deleteById(id);
        return ResponseEntity.ok("Request deleted successfully");
    }
}
