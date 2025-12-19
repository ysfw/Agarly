package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tokenizedCardInfo;
    private String lastFourDigits;
    private String cardType;
    
    @ManyToOne
    private User user;
}
