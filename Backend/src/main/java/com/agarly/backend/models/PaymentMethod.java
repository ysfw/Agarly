package com.agarly.backend.models;

import com.agarly.backend.models.Enums.PaymentProvider;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Data
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private User user;

    @Enumerated(EnumType.STRING)
    private PaymentProvider provider;  // STRIPE, PAYPAL, FAWRY, VODAFONE_CASH

    private String externalAccountId;  // Provider's customer/account ID
    // Stripe: "cus_abc123"
    // PayPal: "PAYPAL-USER-123"
    // Fawry: null (doesn't need one)

    private String tokenizedInfo;      // Provider-specific token
    // Stripe: "pm_card_visa"
    // PayPal: "PAYID-abc123"
    // Vodafone: null (uses phone number)

    // ----- DISPLAY INFO -----
    private String displayName;        // "Visa •••• 4242" or "PayPal (john@gmail.com)"
    private String lastFourDigits;     // "4242" (null for non-card methods)
    private String cardType;           // "VISA" (null for non-card methods)

    // ----- FOR MOBILE WALLETS -----
    private String phoneNumber;        // For Vodafone Cash, InstaPay


    private Integer expiryMonth; // 1-12
    private Integer expiryYear; //20xx

    // ----- STATUS -----
    private Boolean isDefault;
    private Boolean isActive;

    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("Africa/Cairo"));
    private LocalDateTime updatedAt;
}
