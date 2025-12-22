package com.agarly.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrivacySettingsDTO {
    private String profileVisibility; // EVERYONE, VERIFIED_ONLY, PRIVATE
    private boolean showContactInfo;
    private boolean hideAddress;
    private boolean onlyVerifiedMembers;
}
