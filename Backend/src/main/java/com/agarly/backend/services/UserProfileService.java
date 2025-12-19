package com.agarly.backend.services;

import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {
    @Autowired
    private UserRepository userRepository;

    public void updateProfile() {
        // Logic for user updates
    }

    public void changePassword() {
        // Logic for password change
    }
}
