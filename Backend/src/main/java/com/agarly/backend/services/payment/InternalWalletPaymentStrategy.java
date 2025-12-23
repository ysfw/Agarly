package com.agarly.backend.services.payment;

import com.agarly.backend.models.User;
import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class InternalWalletPaymentStrategy implements PaymentStrategy {

    @Autowired
    private UserRepository userRepository;

    @Override
    public PaymentResult initiatePayment(PaymentContext context) {
        User user = context.getUser();
        BigDecimal amount = BigDecimal.valueOf(context.getAmount());

        // 1. Check if user has sufficient funds
        if (user.getWalletBalance().compareTo(amount) < 0) {
            return PaymentResult.builder()
                    .providerName(getProviderName())
                    .success(false)
                    .errorMessage("Insufficient wallet balance.")
                    .build();
        }

        // 2. Deduct amount immediately
        user.setWalletBalance(user.getWalletBalance().subtract(amount));
        userRepository.save(user);

        // 3. Return success
        return PaymentResult.builder()
                .providerName(getProviderName())
                .success(true)
                .orderId("WALLET-" + System.currentTimeMillis()) // Fake Order ID for tracking
                .build();
    }

    @Override
    public String getProviderName() {
        return "INTERNAL_WALLET";
    }
}
