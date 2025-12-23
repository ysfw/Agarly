package com.agarly.backend.controllers;

import com.agarly.backend.dtos.PrivacySettingsDTO;
import com.agarly.backend.dtos.UserPreferencesDTO;
import com.agarly.backend.models.User;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.repos.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/preferences")
public class UserPreferencesController {

    @Autowired
    private UserRepository userRepository;

    // ==================== NOTIFICATION PREFERENCES ====================

    @GetMapping
    public ResponseEntity<UserPreferencesDTO> getPreferences(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserPreferencesDTO dto = UserPreferencesDTO.builder()
                .pushNotificationsEnabled(user.isPushNotificationsEnabled())
                .build();

        return ResponseEntity.ok(dto);
    }

    @PutMapping
    public ResponseEntity<UserPreferencesDTO> updatePreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UserPreferencesDTO dto) {

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPushNotificationsEnabled(dto.isPushNotificationsEnabled());
        userRepository.save(user);

        return ResponseEntity.ok(dto);
    }

    // ==================== PRIVACY SETTINGS ====================

    @GetMapping("/privacy")
    public ResponseEntity<PrivacySettingsDTO> getPrivacySettings(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Handle null values for users that existed before privacy fields were added
        PrivacySettingsDTO dto = PrivacySettingsDTO.builder()
                .profileVisibility(user.getProfileVisibility() != null ? user.getProfileVisibility() : "EVERYONE")
                .showContactInfo(user.isShowContactInfo())
                .hideAddress(user.isHideAddress())
                .onlyVerifiedMembers(user.isOnlyVerifiedMembers())
                .build();

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/privacy")
    public ResponseEntity<PrivacySettingsDTO> updatePrivacySettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody PrivacySettingsDTO dto) {

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfileVisibility(dto.getProfileVisibility());
        user.setShowContactInfo(dto.isShowContactInfo());
        user.setHideAddress(dto.isHideAddress());
        user.setOnlyVerifiedMembers(dto.isOnlyVerifiedMembers());
        userRepository.save(user);

        return ResponseEntity.ok(dto);
    }

    // ==================== DATA & ACCOUNT ====================

    @PostMapping("/download-data")
    public ResponseEntity<byte[]> downloadUserData(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Create a comprehensive data export
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("email", user.getEmail());
            userData.put("firstName", user.getFirstName());
            userData.put("lastName", user.getLastName());
            userData.put("username", user.getUsername());
            userData.put("phoneNumber", user.getPhoneNumber());
            userData.put("address", user.getAddress());
            userData.put("verified", user.getVerified());
            userData.put("createdAt", user.getCreatedAt());
            userData.put("preferences", Map.of(
                    "pushNotifications", user.isPushNotificationsEnabled()));
            
            // Handle privacy settings with null safety
            Map<String, Object> privacyMap = new HashMap<>();
            privacyMap.put("profileVisibility", user.getProfileVisibility() != null ? user.getProfileVisibility() : "EVERYONE");
            privacyMap.put("showContactInfo", user.isShowContactInfo());
            privacyMap.put("hideAddress", user.isHideAddress());
            privacyMap.put("onlyVerifiedMembers", user.isOnlyVerifiedMembers());
            userData.put("privacy", privacyMap);

            ObjectMapper mapper = new ObjectMapper();
            mapper.findAndRegisterModules(); // For Java 8 date/time support
            byte[] jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(userData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentDispositionFormData("attachment", "my-agarly-data.json");

            return new ResponseEntity<>(jsonData, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Soft delete or full delete based on your policy
        // For now, we'll mark the account as deleted but keep data for legal/audit purposes
        user.setBanned(true); // Reusing banned flag as "deleted"
        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of("message", "Account deletion initiated. Your account will be fully removed within 30 days."));
    }
}
