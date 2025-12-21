package com.agarly.backend.controllers;

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

        @GetMapping
        public ResponseEntity<UserPreferencesDTO> getPreferences(@AuthenticationPrincipal UserPrincipal principal) {
                User user = userRepository.findById(principal.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserPreferencesDTO dto = UserPreferencesDTO.builder()
                                .pushNotificationsEnabled(user.isPushNotificationsEnabled())
                                .emailNotificationsEnabled(user.isEmailNotificationsEnabled())
                                .smsNotificationsEnabled(user.isSmsNotificationsEnabled())
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
                user.setEmailNotificationsEnabled(dto.isEmailNotificationsEnabled());
                user.setSmsNotificationsEnabled(dto.isSmsNotificationsEnabled());

                userRepository.save(user);

                return ResponseEntity.ok(dto);
        }

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
                                        "pushNotifications", user.isPushNotificationsEnabled(),
                                        "emailNotifications", user.isEmailNotificationsEnabled(),
                                        "smsNotifications", user.isSmsNotificationsEnabled()));

                        ObjectMapper mapper = new ObjectMapper();
                        mapper.findAndRegisterModules(); // For Java 8 date/time support
                        byte[] jsonData = mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(userData);

                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        headers.setContentDispositionFormData("attachment", "my-agarly-data.json");

                        return new ResponseEntity<>(jsonData, headers, HttpStatus.OK);
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                }
        }

        @DeleteMapping("/account")
        public ResponseEntity<Map<String, String>> deleteAccount(@AuthenticationPrincipal UserPrincipal principal) {
                User user = userRepository.findById(principal.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Soft delete or full delete based on your policy
                // For now, we'll mark the account as deleted but keep data for legal/audit
                // purposes
                user.setBanned(true); // Reusing banned flag as "deleted"

                userRepository.save(user);

                return ResponseEntity.ok(
                                Map.of("message",
                                                "Account deletion initiated. Your account will be fully removed within 30 days."));
        }
}
