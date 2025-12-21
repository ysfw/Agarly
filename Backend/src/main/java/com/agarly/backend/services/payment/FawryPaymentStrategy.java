package com.agarly.backend.services.payment;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;


@Component
public class FawryPaymentStrategy implements PaymentStrategy {

    private final RestTemplate restTemplate = new RestTemplate();

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

            // Call Paymob's pay endpoint
            JsonNode response = restTemplate.postForObject(url, body, JsonNode.class);

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

            return PaymentResult.builder()
                    .providerName(getProviderName())
                    .success(false)
                    .errorMessage("No bill reference received from Paymob")
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
