package com.agarly.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileDTO {
    private String profileImageUrl;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String bio;
    private String address;
    private String city;
    private String state;
    private String zipCode;
}
