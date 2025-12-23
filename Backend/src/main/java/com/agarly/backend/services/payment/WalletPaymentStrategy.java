package com.agarly.backend.services.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class WalletPaymentStrategy implements PaymentStrategy {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public PaymentResult initiatePayment(PaymentContext context) {
        try {
            String url = "https://accept.paymob.com/api/acceptance/payments/pay";

            // Build the wallet payment request
            Map<String, Object> body = new HashMap<>();

            Map<String, String> source = new HashMap<>();
            source.put("identifier", context.getPhoneNumber()); // User's wallet phone number
            source.put("subtype", "WALLET");

            body.put("source", source);
            body.put("payment_token", context.getPaymentKey());

            // Call Paymob's pay endpoint - use String and parse with ObjectMapper
            String responseStr = restTemplate.postForObject(url, body, String.class);
            JsonNode response = objectMapper.readTree(responseStr);

            if (response != null && response.has("redirect_url")) {
                String redirectUrl = response.get("redirect_url").asText();

                return PaymentResult.builder()
                        .providerName(getProviderName())
                        .success(true)
                        .redirectUrl(redirectUrl)
                        .orderId(context.getOrderId())
                        .build();
            } else {
                String errorMsg = "No redirect URL received from Paymob";
                if (response != null && response.has("message")) {
                    errorMsg = response.get("message").asText();
                }
                return PaymentResult.builder()
                        .providerName(getProviderName())
                        .success(false)
                        .errorMessage(errorMsg)
                        .build();
            }
        } catch (Exception e) {
            return PaymentResult.builder()
                    .providerName(getProviderName())
                    .success(false)
                    .errorMessage("Wallet payment failed: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public String getProviderName() {
        return "WALLET";
    }
}
