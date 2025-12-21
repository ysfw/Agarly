package com.agarly.backend.services.payment;

public interface PaymentStrategy {

    PaymentResult initiatePayment(PaymentContext context);
    String getProviderName();
}
