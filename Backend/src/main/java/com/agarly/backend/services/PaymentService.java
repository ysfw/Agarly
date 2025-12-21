package com.agarly.backend.services;
import com.agarly.backend.dtos.*;
import com.agarly.backend.models.PaymentMethod;
import com.agarly.backend.models.Transaction;
import com.agarly.backend.models.User;
import com.agarly.backend.models.Enums.TransactionStatus;
import com.agarly.backend.models.Enums.TransactionType;
import com.agarly.backend.repos.PaymentMethodRepository;
import com.agarly.backend.repos.TransactionRepository;
import com.agarly.backend.repos.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import net.minidev.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;


    @Value("${paymob.api-key}")
    private String apiKey;

    // IDs you got from the Dashboard
    @Value("${paymob.card-id}")
    private String cardIntegrationId;

    @Value("${paymob.wallet-id}")
    private String walletIntegrationId;

    @Value("${paymob.fawry-id}")
    private String fawryIntegrationId;

    private final RestTemplate restTemplate = new RestTemplate();

    private String getAuthToken() {
        String url = "https://accept.paymob.com/api/auth/tokens";
        PaymobAuthRequest request = new PaymobAuthRequest(apiKey);
        PaymobAuthResponse response = restTemplate.postForObject(url, request, PaymobAuthResponse.class);
        assert response != null;
        return response.getToken();
    }

    // common for all
    private String createOrder(String token, double amount) {
        String url = "https://accept.paymob.com/api/ecommerce/orders";
        // Convert 100.00 EGP -> "10000" cents
        String amountCents = String.valueOf((int) (amount * 100));

        PaymobOrderRequest request = new PaymobOrderRequest();
        request.setAuth_token(token);
        request.setAmount_cents(amountCents);

        // This returns a huge JSON, we just need the "id"
        JsonNode response = restTemplate.postForObject(url, request, JsonNode.class);
        assert response != null;
        return response.get("id").asText();
    }

    private String getPaymentKey(String token, String orderId, double amount, String method) {
        String url = "https://accept.paymob.com/api/acceptance/payment_keys";
        String integrationId = switch (method.toUpperCase()) {
            case "CARD" -> cardIntegrationId;
            case "WALLET" -> walletIntegrationId;
            case "FAWRY" -> fawryIntegrationId;
            default -> throw new RuntimeException("Unknown method");
        };

        // SELECT INTEGRATION BASED ON USER CHOICE

        PaymobKeyRequest request = new PaymobKeyRequest();
        request.setAuth_token(token);
        request.setOrder_id(orderId);
        request.setIntegration_id(integrationId);
        request.setAmount_cents(String.valueOf((int)(amount * 100)));
        request.setBilling_data(new JSONObject()); // Required by Paymob

        JsonNode response = restTemplate.postForObject(url, request, JsonNode.class);
        assert response != null;
        return response.get("token").asText();
    }

    // PUBLIC METHOD called by Controller
    public Object initiatePayment(double amount, String method, String userPhone) {
        String token = getAuthToken();
        String orderId = createOrder(token, amount);
        String paymentKey = getPaymentKey(token, orderId, amount, method);

        // FINAL STEP: HANDLE SPECIFIC PROVIDERS
        return switch (method) {
            case "CARD" ->
                // For card, we just return the key. Frontend handles the Iframe.
                    paymentKey;
            case "WALLET" ->
                // Wallets need a 4th request
                    payWithWallet(paymentKey, userPhone);
            case "FAWRY" ->
                // Fawry needs a 4th request
                    payWithFawry(paymentKey);
            default -> null;
        };
    }

    private String payWithWallet(String paymentKey, String phone) {
        String url = "https://accept.paymob.com/api/acceptance/payments/pay";
        Map<String, Object> body = new HashMap<>();

        Map<String, String> source = new HashMap<>();
        source.put("identifier", phone); // The user's wallet number
        source.put("subtype", "WALLET");

        body.put("source", source);
        body.put("payment_token", paymentKey);

        JsonNode response = restTemplate.postForObject(url, body, JsonNode.class);
        // Return the redirection URL
        assert response != null;
        return response.get("redirect_url").asText();
    }

    private String payWithFawry(String paymentKey) {
        String url = "https://accept.paymob.com/api/acceptance/payments/pay";
        Map<String, Object> body = new HashMap<>();

        Map<String, String> source = new HashMap<>();
        source.put("identifier", "AGGREGATOR");
        source.put("subtype", "AGGREGATOR");

        body.put("source", source);
        body.put("payment_token", paymentKey);

        JsonNode response = restTemplate.postForObject(url, body, JsonNode.class);
        // Return the Reference Number (e.g. 981273)
        assert response != null;
        return response.get("data").get("bill_reference").asText();
    }

    public List<PaymentMethodDTO> getPaymentMethods(Long userId) {
        List<PaymentMethod> methods = paymentMethodRepository.findByUserIdAndIsActiveTrue(userId);

        // Convert Entity -> DTO (we don't want to expose internal fields)
        return methods.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }


    @Transactional  // If anything fails, rollback the entire operation
    public PaymentMethodDTO addPaymentMethod(Long userId, PaymentMethodDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PaymentMethod method = new PaymentMethod();
        method.setUser(user);
        method.setProvider(dto.getProvider());

        // SECURITY: Never store full card number!
        // In real app, you'd send to Stripe/PayPal and get a token back
        String lastFour = dto.getCardNumber().replaceAll("\\s", "").substring(
                dto.getCardNumber().replaceAll("\\s", "").length() - 4
        );

        method.setLastFourDigits(lastFour);
        method.setCardType(detectCardType(dto.getCardNumber()));
        method.setDisplayName(method.getCardType() + " •••• " + lastFour);
        method.setExpiryMonth(dto.getExpiryMonth());
        method.setExpiryYear(dto.getExpiryYear());

        // In real app: method.setTokenizedInfo(stripeToken);
        method.setTokenizedInfo("SIMULATED_TOKEN_" + UUID.randomUUID());

        method.setIsActive(true);
        method.setIsDefault(paymentMethodRepository.findByUserIdAndIsActiveTrue(userId).isEmpty());

        PaymentMethod saved = paymentMethodRepository.save(method);
        return toDTO(saved);
    }

    @Transactional
    public void removePaymentMethod(Long userId, Long methodId) {
        PaymentMethod method = paymentMethodRepository.findByIdAndUserId(methodId, userId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        method.setIsActive(false);
        method.setUpdatedAt(LocalDateTime.now(ZoneId.of("Africa/Cairo")));
        paymentMethodRepository.save(method);
    }

    @Transactional
    public PaymentMethodDTO setDefaultPaymentMethod(Long userId, Long methodId) {
        // Remove default from current default
        paymentMethodRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(current -> {
                    current.setIsDefault(false);
                    paymentMethodRepository.save(current);
                });

        // Set new default
        PaymentMethod method = paymentMethodRepository.findByIdAndUserId(methodId, userId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        method.setIsDefault(true);
        method.setUpdatedAt(LocalDateTime.now(ZoneId.of("Africa/Cairo")));
        return toDTO(paymentMethodRepository.save(method));
    }

    @Transactional
    public TransactionDTO charge(Long userId, ChargeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PaymentMethod method = paymentMethodRepository
                .findByIdAndUserId(request.getPaymentMethodId(), userId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        // Create transaction record
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setPaymentMethod(method);
        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.PAYMENT);
        tx.setStatus(TransactionStatus.COMPLETED);  // In real app: start as PENDING
        tx.setDescription(request.getDescription());
        tx.setReferenceNumber("TXN-" + System.currentTimeMillis());
        tx.setCreatedAt(LocalDateTime.now(ZoneId.of("Africa/Cairo")));

        // Calculate fees (example: 5% platform fee)
        BigDecimal fee = request.getAmount().multiply(new BigDecimal("0.05"));
        tx.setFee(fee);
        tx.setNetAmount(request.getAmount().subtract(fee));

        Transaction saved = transactionRepository.save(tx);
        return toTransactionDTO(saved);
    }

    public Page<TransactionDTO> getTransactionHistory(Long userId, Pageable pageable) {
        Page<Transaction> transactions = transactionRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return transactions.map(this::toTransactionDTO);
    }

    private PaymentMethodDTO toDTO(PaymentMethod method) {
        return PaymentMethodDTO.builder()
                .id(method.getId())
                .provider(method.getProvider())
                .displayName(method.getDisplayName())
                .lastFourDigits(method.getLastFourDigits())
                .cardType(method.getCardType())
                .expiryMonth(method.getExpiryMonth())
                .expiryYear(method.getExpiryYear())
                .phoneNumber(method.getPhoneNumber())
                .isDefault(method.getIsDefault())
                .isActive(method.getIsActive())
                .build();
        // NEVER include cardNumber or cvv in the response!
    }

    private TransactionDTO toTransactionDTO(Transaction tx) {
        return TransactionDTO.builder()
                .id(tx.getId())
                .amount(tx.getAmount())
                .type(tx.getType())
                .status(tx.getStatus())
                .description(tx.getDescription())
                .referenceNumber(tx.getReferenceNumber())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    private String detectCardType(String cardNumber) {
        String cleaned = cardNumber.replaceAll("\\s", "");
        if (cleaned.startsWith("4")) return "VISA";
        if (cleaned.startsWith("5")) return "MASTERCARD";
        if (cleaned.startsWith("3")) return "AMEX";
        return "CARD";
    }
}