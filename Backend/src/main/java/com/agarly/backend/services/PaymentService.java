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
import com.agarly.backend.services.payment.PaymentContext;
import com.agarly.backend.services.payment.PaymentResult;
import com.agarly.backend.services.payment.PaymentStrategy;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.PostConstruct;
import net.minidev.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    // All payment strategies are auto-injected by Spring
    @Autowired
    private List<PaymentStrategy> paymentStrategies;

    // Map for fast strategy lookup by provider name
    private Map<String, PaymentStrategy> strategyMap;

    @Value("${paymob.api-key}")
    private String apiKey;

    @Value("${paymob.card-id}")
    private String cardIntegrationId;

    @Value("${paymob.wallet-id}")
    private String walletIntegrationId;

    @Value("${paymob.fawry-id}")
    private String fawryIntegrationId;

    @Value("${HMAC_SECRET}")
    private String hmacSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void initStrategies() {
        strategyMap = paymentStrategies.stream()
                .collect(Collectors.toMap(
                        PaymentStrategy::getProviderName,
                        strategy -> strategy));
    }

    private String getAuthToken() {
        String url = "https://accept.paymob.com/api/auth/tokens";
        PaymobAuthRequest request = new PaymobAuthRequest(apiKey);
        PaymobAuthResponse response = restTemplate.postForObject(url, request, PaymobAuthResponse.class);
        assert response != null;
        return response.getToken();
    }

    private String createOrder(String token, double amount) {
        String url = "https://accept.paymob.com/api/ecommerce/orders";
        String amountCents = String.valueOf((int) (amount * 100));

        PaymobOrderRequest request = new PaymobOrderRequest();
        request.setAuth_token(token);
        request.setAmount_cents(amountCents);

        JsonNode response = restTemplate.postForObject(url, request, JsonNode.class);
        assert response != null;
        return response.get("id").asText();
    }

    private String getPaymentKey(String username, String token, String orderId, double amount, String method) {
        String url = "https://accept.paymob.com/api/acceptance/payment_keys";
        String integrationId = switch (method.toUpperCase()) {
            case "CARD" -> cardIntegrationId;
            case "WALLET" -> walletIntegrationId;
            case "FAWRY" -> fawryIntegrationId;
            default -> throw new RuntimeException("Unknown payment method: " + method);
        };

        PaymobKeyRequest request = new PaymobKeyRequest();
        request.setAuth_token(token);
        request.setOrder_id(orderId);
        request.setIntegration_id(integrationId);
        request.setAmount_cents(String.valueOf((int) (amount * 100)));

        User user = userRepository.findByUsername(username);
        Map<String, Object> billingData = getBillingData(user);
        request.setBilling_data(new JSONObject(billingData));

        JsonNode response = restTemplate.postForObject(url, request, JsonNode.class);
        assert response != null;
        return response.get("token").asText();
    }

    private static Map<String, Object> getBillingData(User user) {
        Map<String, Object> billingData = new HashMap<>();
        billingData.put("email", user.getEmail());
        billingData.put("first_name", user.getFirstName());
        billingData.put("last_name", user.getLastName());
        billingData.put("phone_number", user.getPhoneNumber());
        billingData.put("country", "EG");
        billingData.put("city", user.getProfile() != null ? user.getProfile().getCity() : "Cairo");
        billingData.put("street", "NA");
        billingData.put("building", "NA");
        billingData.put("floor", "NA");
        billingData.put("apartment", "NA");
        return billingData;
    }

    @Transactional
    public InitiatePaymentResponse initiatePayment(Long userId, InitiatePaymentRequest request) {
        try {
            // 1. Validate user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 2. Find the strategy for this payment method
            String method = request.getMethod().toUpperCase();
            PaymentStrategy strategy = strategyMap.get(method);
            if (strategy == null) {
                return InitiatePaymentResponse.builder()
                        .success(false)
                        .errorMessage("Unknown payment method: " + method)
                        .build();
            }

            // 3. Get Paymob authentication and create order
            String authToken = getAuthToken();
            String orderId = createOrder(authToken, request.getAmount());
            String paymentKey = getPaymentKey(user.getUsername(), authToken, orderId, request.getAmount(), method);

            // 4. Build context for strategy
            PaymentContext context = PaymentContext.builder()
                    .user(user)
                    .amount(request.getAmount())
                    .phoneNumber(request.getPhoneNumber())
                    .bookingId(request.getBookingId())
                    .description(request.getDescription())
                    .authToken(authToken)
                    .orderId(orderId)
                    .paymentKey(paymentKey)
                    .build();

            // 5. Delegate to the strategy
            PaymentResult result = strategy.initiatePayment(context);

            // 6. Create a PENDING transaction record
            Transaction tx = new Transaction();
            tx.setUser(user);
            tx.setAmount(BigDecimal.valueOf(request.getAmount()));
            tx.setType(TransactionType.PAYMENT);
            tx.setStatus(TransactionStatus.PENDING);
            tx.setDescription(request.getDescription());
            tx.setReferenceNumber(result.getFawryReference() != null ? result.getFawryReference() : "ORDER-" + orderId);
            tx.setCreatedAt(LocalDateTime.now(ZoneId.of("Africa/Cairo")));
            transactionRepository.save(tx);

            // 7. Return response to frontend
            return InitiatePaymentResponse.builder()
                    .success(result.isSuccess())
                    .errorMessage(result.getErrorMessage())
                    .method(method)
                    .orderId(orderId)
                    .paymentKey(result.getPaymentKey())
                    .iframeId(result.getIframeId())
                    .redirectUrl(result.getRedirectUrl())
                    .fawryReference(result.getFawryReference())
                    .build();

        } catch (Exception e) {
            return InitiatePaymentResponse.builder()
                    .success(false)
                    .errorMessage("Payment initiation failed: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    public boolean handleWebhook(Map<String, Object> payload, String hmacHeader) {
        try {
            // 1. Verify HMAC signature (security check)
            if (!verifyHmac(payload, hmacHeader)) {
                return false;
            }

            // 2. Extract transaction details
            @SuppressWarnings("unchecked")
            Map<String, Object> obj = (Map<String, Object>) payload.get("obj");
            if (obj == null)
                return false;

            boolean success = (boolean) obj.getOrDefault("success", false);
            String orderId = String.valueOf(obj.get("order"));

            // 3. Find and update the transaction
            String referenceNumber = "ORDER-" + orderId;
            List<Transaction> transactions = transactionRepository.findAll().stream()
                    .filter(tx -> tx.getReferenceNumber() != null &&
                            (tx.getReferenceNumber().equals(referenceNumber) ||
                                    tx.getReferenceNumber().equals(String.valueOf(obj.get("data")))))
                    .toList();

            for (Transaction tx : transactions) {
                tx.setStatus(success ? TransactionStatus.COMPLETED : TransactionStatus.FAILED);
                tx.setUpdatedAt(LocalDateTime.now(ZoneId.of("Africa/Cairo")));
                transactionRepository.save(tx);
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean verifyHmac(Map<String, Object> payload, String receivedHmac) {
        try {
            // Paymob uses specific fields for HMAC calculation
            @SuppressWarnings("unchecked")
            Map<String, Object> obj = (Map<String, Object>) payload.get("obj");
            if (obj == null)
                return false;

            // Build the string to hash (Paymob-specific order)
            StringBuilder sb = new StringBuilder();
            sb.append(obj.getOrDefault("amount_cents", ""));
            sb.append(obj.getOrDefault("created_at", ""));
            sb.append(obj.getOrDefault("currency", ""));
            sb.append(obj.getOrDefault("error_occured", ""));
            sb.append(obj.getOrDefault("has_parent_transaction", ""));
            sb.append(obj.getOrDefault("id", ""));
            sb.append(obj.getOrDefault("integration_id", ""));
            sb.append(obj.getOrDefault("is_3d_secure", ""));
            sb.append(obj.getOrDefault("is_auth", ""));
            sb.append(obj.getOrDefault("is_capture", ""));
            sb.append(obj.getOrDefault("is_refunded", ""));
            sb.append(obj.getOrDefault("is_standalone_payment", ""));
            sb.append(obj.getOrDefault("is_voided", ""));
            sb.append(obj.getOrDefault("order", ""));
            sb.append(obj.getOrDefault("owner", ""));
            sb.append(obj.getOrDefault("pending", ""));

            @SuppressWarnings("unchecked")
            Map<String, Object> sourceData = (Map<String, Object>) obj.get("source_data");
            if (sourceData != null) {
                sb.append(sourceData.getOrDefault("pan", ""));
                sb.append(sourceData.getOrDefault("sub_type", ""));
                sb.append(sourceData.getOrDefault("type", ""));
            }

            sb.append(obj.getOrDefault("success", ""));

            // Calculate HMAC
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec keySpec = new SecretKeySpec(hmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(keySpec);
            byte[] hash = mac.doFinal(sb.toString().getBytes(StandardCharsets.UTF_8));

            // Convert to hex
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString().equalsIgnoreCase(receivedHmac);
        } catch (Exception e) {
            return false;
        }
    }


    public List<PaymentMethodDTO> getPaymentMethods(Long userId) {
        List<PaymentMethod> methods = paymentMethodRepository.findByUserIdAndIsActiveTrue(userId);
        return methods.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentMethodDTO addPaymentMethod(Long userId, PaymentMethodDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PaymentMethod method = new PaymentMethod();
        method.setUser(user);
        method.setProvider(dto.getProvider());

        // SECURITY: Never store full card number!
        String lastFour = dto.getCardNumber().replaceAll("\\s", "").substring(
                dto.getCardNumber().replaceAll("\\s", "").length() - 4);

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
        paymentMethodRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(current -> {
                    current.setIsDefault(false);
                    paymentMethodRepository.save(current);
                });

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

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setPaymentMethod(method);
        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.PAYMENT);
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setDescription(request.getDescription());
        tx.setReferenceNumber("TXN-" + System.currentTimeMillis());
        tx.setCreatedAt(LocalDateTime.now(ZoneId.of("Africa/Cairo")));

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
        if (cleaned.startsWith("4"))
            return "VISA";
        if (cleaned.startsWith("5"))
            return "MASTERCARD";
        if (cleaned.startsWith("3"))
            return "AMEX";
        return "CARD";
    }
}