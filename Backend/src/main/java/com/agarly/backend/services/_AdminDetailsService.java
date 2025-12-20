package com.agarly.backend.services;

import com.agarly.backend.models.Admin;
import com.agarly.backend.models.AdminPrincipal;
import com.agarly.backend.repos.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class _AdminDetailsService implements UserDetailsService {

    @Autowired
    private AdminRepository adminRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Admin admin = adminRepo.findByEmail(email).orElse(null);

        if (admin == null) {
            throw new UsernameNotFoundException(email + " not found in admin table");
        }

        return new AdminPrincipal(admin);
    }

    /**
     * Check if an admin exists with the given email without throwing exception
     */
    public boolean adminExists(String email) {
        return adminRepo.existsByEmail(email);
    }
}
