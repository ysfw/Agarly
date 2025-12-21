package com.agarly.backend.dtos;
import com.agarly.backend.models.Enums.PaymentProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodDTO {
    private Long id;
    private PaymentProvider provider;

    // For adding NEW cards (input from frontend)
    private String cardNumber;       // Only for NEW card input, never stored/returned
    private String cardholderName;
    private Integer expiryMonth;
    private Integer expiryYear;
    private String cvv;              // Only for NEW card input, never stored/returned

    // For RETURNING existing cards to frontend (safe to show)
    private String displayName;      // "Visa •••• 4242"
    private String lastFourDigits;   // "4242"
    private String cardType;         // "VISA", "MASTERCARD"

    // For mobile wallets
    private String phoneNumber;

    // Status
    private Boolean isDefault;
    private Boolean isActive;
}