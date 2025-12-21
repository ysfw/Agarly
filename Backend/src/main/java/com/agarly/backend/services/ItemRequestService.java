package com.agarly.backend.services;

import com.agarly.backend.models.ItemRequest;
import com.agarly.backend.repos.ItemRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemRequestService {

    @Autowired
    private ItemRequestRepository repository;

    public ItemRequest createRequest(ItemRequest request, Authentication authentication) {
        if (authentication != null) {
            String email = authentication.getName();
            request.setUserEmail(email);
        }
        return repository.save(request);
    }

    public List<ItemRequest> getAllRequests() {
        return repository.findAll();
    }
}
