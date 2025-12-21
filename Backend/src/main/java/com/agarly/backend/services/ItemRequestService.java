package com.agarly.backend.services;

import com.agarly.backend.models.ItemRequest;
import com.agarly.backend.models.User;
import com.agarly.backend.repos.ItemRequestRepository;
import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemRequestService {

    @Autowired
    private ItemRequestRepository repository;

    @Autowired
    private UserRepository userRepository;

    public ItemRequest createRequest(ItemRequest request, Authentication authentication) {
        if (authentication != null) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email);
            if (user != null) {
                request.setRequester(user);
            }
        }
        request.setStatus("PENDING");
        return repository.save(request);
    }

    public List<ItemRequest> getAllRequests() {
        return repository.findAll();
    }

    public List<ItemRequest> getRequestsByUser(User user) {
        return repository.findByRequester(user);
    }
}
