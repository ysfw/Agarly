package com.agarly.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private String profileImageUrl;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String bio;
    private String address;
    private String city;

    // Profile statistics
    private Long itemsShared;
    private Long itemsBorrowed;
    private Double averageRating;
    private Long reviewCount;
}
