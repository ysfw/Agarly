package com.agarly.backend.services;

import com.agarly.backend.dtos.PasswordChangeRequest;
import com.agarly.backend.dtos.UserProfileDTO;
import com.agarly.backend.exceptions.UserNotFoundException;
import com.agarly.backend.exceptions.WrongPasswordException;
import com.agarly.backend.models.User;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.models.UserProfile;
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

    public UserProfileDTO getProfile(String username) {
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new UserNotFoundException("The user associated with username{" + username + "} is not found");
        }
        return UserProfileDTO.builder()
                .profileImageUrl(user.getProfileImageUrl())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .bio(user.getProfile().getBio())
                .address(user.getAddress())
                .city(user.getProfile().getCity())
                .state(user.getProfile().getState())
                .zipCode(user.getProfile().getZipCode())
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
        user.setEmail(request.getEmail());
        user.getProfile().setBio(request.getBio());
        user.getProfile().setCity(request.getCity());
        user.getProfile().setState(request.getState());
        user.getProfile().setZipCode(request.getZipCode());

        userRepository.save(user);
    }

    public void changePassword(UserPrincipal principal, PasswordChangeRequest request) {
        String oldPassword = request.getOldPassword();
        String newPassword = request.getNewPassword();

        String username = principal.getUsername();
        String hashedPassword = principal.getPassword();

        String hashedOldPassword = PasswordEncoder.encode(oldPassword);

        assert hashedOldPassword != null;
        if (hashedOldPassword.equals(hashedPassword)) {
            User user = userService.findByUsername(username);
            user.setPassword(newPassword);
            userService.save(user);
        } else {
            throw new WrongPasswordException("The old password entered is wrong");
        }
    }
}
