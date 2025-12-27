package com.agarly.backend.services;

import com.agarly.backend.dtos.PasswordChangeRequest;
import com.agarly.backend.dtos.UserProfileDTO;
import com.agarly.backend.exceptions.UserNotFoundException;
import com.agarly.backend.exceptions.WrongPasswordException;
import com.agarly.backend.models.User;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.models.UserProfile;
import com.agarly.backend.repos.ItemRepository;
import com.agarly.backend.repos.ReviewRepository;
import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private BCryptPasswordEncoder PasswordEncoder = new BCryptPasswordEncoder(12);

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public UserProfileDTO getProfile(String username) {
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new UserNotFoundException("The user associated with username{" + username + "} is not found");
        }

        // Fetch profile statistics
        Long itemsShared = itemRepository.countByOwner(user);
        Long itemsBorrowed = itemRepository.countByBorrower(user);
        Double averageRating = reviewRepository.findAverageRatingByUserId(user.getId()).orElse(0.0);
        Long reviewCount = reviewRepository.countByTargetUserId(user.getId());

        return UserProfileDTO.builder()
                .profileImageUrl(user.getProfileImageUrl())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .bio(user.getProfile() != null ? user.getProfile().getBio() : null)
                .address(user.getAddress())
                .city(user.getProfile() != null ? user.getProfile().getCity() : null)
                .itemsShared(itemsShared != null ? itemsShared : 0L)
                .itemsBorrowed(itemsBorrowed != null ? itemsBorrowed : 0L)
                .averageRating(averageRating)
                .reviewCount(reviewCount != null ? reviewCount : 0L)
                .build();
    }

    public void updateProfile(String username, UserProfileDTO request) {
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new UserNotFoundException("User associated with this username:{'" + username + "'} is not found");
        }

        user.setProfileImageUrl(request.getProfileImageUrl());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.getProfile().setBio(request.getBio());
        user.getProfile().setCity(request.getCity());

        userRepository.save(user);
    }

    public void changePassword(UserPrincipal principal, PasswordChangeRequest request) {
        String oldPassword = request.getOldPassword();
        String newPassword = request.getNewPassword();

        String username = principal.getUsername();
        String hashedPassword = principal.getPassword();

        if (PasswordEncoder.matches(oldPassword, hashedPassword)) {
            User user = userService.findByUsername(username);
            // Hash the new password before saving
            user.setPassword(newPassword);
            userService.save(user); // the hashing happens inside this
        } else {
            throw new WrongPasswordException("The old password entered is wrong");
        }
    }
}
