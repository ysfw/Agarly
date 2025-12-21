package com.agarly.backend.services.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CardPaymentStrategy implements PaymentStrategy {

    @Value("${paymob.iframe-id}")
    private String iframeId;

    @Override
    public PaymentResult initiatePayment(PaymentContext context) {

        return PaymentResult.builder()
                .providerName(getProviderName())
                .success(true)
                .paymentKey(context.getPaymentKey())
                .iframeId(iframeId)
                .orderId(context.getOrderId())
                .build();
    }

    @Override
    public String getProviderName() {
        return "CARD";
    }
}
