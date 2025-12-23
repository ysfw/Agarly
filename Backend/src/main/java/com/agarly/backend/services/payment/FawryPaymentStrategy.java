package com.agarly.backend.services.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class FawryPaymentStrategy implements PaymentStrategy {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public PaymentResult initiatePayment(PaymentContext context) {
        try {
            String url = "https://accept.paymob.com/api/acceptance/payments/pay";

            // Build the Fawry payment request
            Map<String, Object> body = new HashMap<>();

            // AGGREGATOR source tells Paymob this is a Fawry payment
            Map<String, String> source = new HashMap<>();
            source.put("identifier", "AGGREGATOR");
            source.put("subtype", "AGGREGATOR");

            body.put("source", source);
            body.put("payment_token", context.getPaymentKey());

            // Call Paymob's pay endpoint - use String and parse with ObjectMapper
            String responseStr = restTemplate.postForObject(url, body, String.class);
            JsonNode response = objectMapper.readTree(responseStr);

            if (response != null && response.has("data")) {
                JsonNode data = response.get("data");
                if (data.has("bill_reference")) {
                    String billReference = data.get("bill_reference").asText();

                    return PaymentResult.builder()
                            .providerName(getProviderName())
                            .success(true)
                            .fawryReference(billReference)
                            .orderId(context.getOrderId())
                            .build();
                }
            }

            String errorMsg = "No bill reference received from Paymob";
            if (response != null && response.has("message")) {
                errorMsg = response.get("message").asText();
            }
            return PaymentResult.builder()
                    .providerName(getProviderName())
                    .success(false)
                    .errorMessage(errorMsg)
                    .build();

        } catch (Exception e) {
            return PaymentResult.builder()
                    .providerName(getProviderName())
                    .success(false)
                    .errorMessage("Fawry payment failed: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public String getProviderName() {
        return "FAWRY";
    }
}
