package com.agarly.backend.controllers;

import com.agarly.backend.models.ItemRequest;
import com.agarly.backend.models.User;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.repos.ItemRequestRepository;
import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/item-requests")
public class ItemRequestController {

    @Autowired
    private ItemRequestRepository itemRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ItemRequest>> getAllRequests() {
        return ResponseEntity.ok(itemRequestRepository.findAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<ItemRequest>> getMyRequests(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(itemRequestRepository.findByRequester(user));
    }

    @PostMapping
    public ResponseEntity<ItemRequest> createRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ItemRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        request.setRequester(user);
        request.setStatus("PENDING");
        return ResponseEntity.ok(itemRequestRepository.save(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        itemRequestRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
