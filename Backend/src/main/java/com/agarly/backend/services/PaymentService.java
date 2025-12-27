package com.agarly.backend.services;

import com.agarly.backend.dtos.*;
import com.agarly.backend.models.PaymentMethod;
import com.agarly.backend.models.Transaction;
import com.agarly.backend.models.User;
import com.agarly.backend.models.Enums.TransactionStatus;
import com.agarly.backend.models.Enums.TransactionType;
import com.agarly.backend.models.Booking;
import com.agarly.backend.repos.BookingRepository;
import com.agarly.backend.repos.PaymentMethodRepository;
import com.agarly.backend.repos.TransactionRepository;
import com.agarly.backend.repos.UserRepository;
import com.agarly.backend.services.payment.PaymentContext;
import com.agarly.backend.services.payment.PaymentResult;
import com.agarly.backend.services.payment.PaymentStrategy;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private EventService eventService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

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

        try {
            String responseStr = restTemplate.postForObject(url, request, String.class);
            JsonNode response = objectMapper.readTree(responseStr);
            assert response != null;
            return response.get("id").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Paymob order: " + e.getMessage(), e);
        }
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
        request.setRedirection_url("http://localhost:4200/dashboard");

        User user = userRepository.findByUsername(username);
        Map<String, Object> billingData = getBillingData(user);
        request.setBilling_data(new JSONObject(billingData));

        try {
            String responseStr = restTemplate.postForObject(url, request, String.class);
            JsonNode response = objectMapper.readTree(responseStr);
            assert response != null;
            return response.get("token").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get payment key: " + e.getMessage(), e);
        }
    }

    private static Map<String, Object> getBillingData(User user) {
        Map<String, Object> billingData = new HashMap<>();

        // Helper to provide default for null/empty strings
        String email = user.getEmail() != null && !user.getEmail().isBlank()
                ? user.getEmail()
                : "customer@agarly.com";
        String firstName = user.getFirstName() != null && !user.getFirstName().isBlank()
                ? user.getFirstName()
                : "Customer";
        String lastName = user.getLastName() != null && !user.getLastName().isBlank()
                ? user.getLastName()
                : "User";
        String phoneNumber = user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()
                ? user.getPhoneNumber()
                : "01000000000";
        String city = "Cairo"; // Default city
        if (user.getProfile() != null && user.getProfile().getCity() != null
                && !user.getProfile().getCity().isBlank()) {
            city = user.getProfile().getCity();
        }

        billingData.put("email", email);
        billingData.put("first_name", firstName);
        billingData.put("last_name", lastName);
        billingData.put("phone_number", phoneNumber);
        billingData.put("country", "EG");
        billingData.put("city", city);
        billingData.put("street", "NA");
        billingData.put("building", "NA");
        billingData.put("floor", "NA");
        billingData.put("apartment", "NA");
        return billingData;
    }

    @Transactional
    public InitiatePaymentResponse initiatePayment(Long userId, InitiatePaymentRequest request) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String method = request.getMethod().toUpperCase();
            PaymentStrategy strategy = strategyMap.get(method);
            if (strategy == null) {
                return InitiatePaymentResponse.builder()
                        .success(false)
                        .errorMessage("Unknown payment method: " + method)
                        .build();
            }

            String authToken = null;
            String orderId = null;
            String paymentKey = null;

            if (!"INTERNAL_WALLET".equals(method)) {
                authToken = getAuthToken();
                orderId = createOrder(authToken, request.getAmount());
                paymentKey = getPaymentKey(user.getUsername(), authToken, orderId, request.getAmount(), method);
            }

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

            PaymentResult result = strategy.initiatePayment(context);

            Transaction tx = new Transaction();
            tx.setUser(user);
            tx.setAmount(BigDecimal.valueOf(request.getAmount()));
            tx.setType(TransactionType.PAYMENT);
            tx.setDescription(request.getDescription());
            tx.setCreatedAt(LocalDateTime.now(ZoneId.of("Africa/Cairo")));

            // For wallet payments, transaction is immediately completed
            if ("INTERNAL_WALLET".equals(method)) {
                if (result.isSuccess()) {
                    tx.setStatus(TransactionStatus.COMPLETED);
                    tx.setReferenceNumber("WALLET-" + System.currentTimeMillis());
                } else {
                    tx.setStatus(TransactionStatus.FAILED);
                    tx.setReferenceNumber("FAILED-" + System.currentTimeMillis());
                }
            } else {
                tx.setStatus(TransactionStatus.PENDING);
                tx.setReferenceNumber(
                        result.getFawryReference() != null ? result.getFawryReference() : "ORDER-" + orderId);
            }

            // Link to booking if provided
            if (request.getBookingId() != null) {
                bookingRepository.findById(request.getBookingId())
                        .ifPresent(tx::setBooking);
            }

            Transaction savedTx = transactionRepository.save(tx);

            if ("INTERNAL_WALLET".equals(method) && result.isSuccess()) {
                processTransaction(result.getOrderId(), true);
                if (savedTx.getBooking() != null) {
                    Booking booking = savedTx.getBooking();
                    if (booking.getStatus() == com.agarly.backend.models.Enums.BookingStatus.AWAITING_PAYMENT) {
                        booking.setStatus(com.agarly.backend.models.Enums.BookingStatus.PENDING);
                        bookingRepository.save(booking);
                        if (booking.getItem() != null && booking.getItem().getOwner() != null) {
                            String ownerUsername = booking.getItem().getOwner().getUsername();
                            eventService.publishEvent(
                                    new com.agarly.backend.models.SSE("BOOKING_CREATED", List.of(ownerUsername)));
                        }
                    }
                }
            }

            return InitiatePaymentResponse.builder()
                    .success(result.isSuccess())
                    .errorMessage(result.getErrorMessage())
                    .method(method)
                    .orderId(result.getOrderId())
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
            if (!verifyHmac(payload, hmacHeader)) {
                return false;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> obj = (Map<String, Object>) payload.get("obj");
            if (obj == null)
                return false;

            boolean success = (boolean) obj.getOrDefault("success", false);
            String orderId = String.valueOf(obj.get("order"));

            processTransaction(orderId, success);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public boolean verifyPayment(Map<String, String> params) {
        try {
            String successStr = params.get("success");
            boolean success = "true".equalsIgnoreCase(successStr);
            String orderId = params.get("order");

            if (orderId == null) {
                orderId = params.get("id");
            }

            if (orderId != null) {
                return processTransaction(orderId, success);
            }

            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean processTransaction(String orderId, boolean success) {
        String referenceNumber = "ORDER-" + orderId;
        Optional<Transaction> txOpt = transactionRepository.findByReferenceNumber(referenceNumber);

        if (txOpt.isPresent()) {
            Transaction tx = txOpt.get();

            // Idempotency check: if already completed, don't re-process
            if (tx.getStatus() == TransactionStatus.COMPLETED) {
                return true;
            }

            tx.setStatus(success ? TransactionStatus.COMPLETED : TransactionStatus.FAILED);
            tx.setUpdatedAt(LocalDateTime.now(ZoneId.of("Africa/Cairo")));
            transactionRepository.save(tx);

            if (success && tx.getBooking() != null) {
                Booking booking = tx.getBooking();
                if (booking.getStatus() == com.agarly.backend.models.Enums.BookingStatus.AWAITING_PAYMENT) {
                    booking.setStatus(com.agarly.backend.models.Enums.BookingStatus.PENDING);
                    bookingRepository.save(booking);

                    // Notify owner that booking is now valid/paid and pending approval
                    if (booking.getItem() != null && booking.getItem().getOwner() != null) {
                        String ownerUsername = booking.getItem().getOwner().getUsername();
                        eventService.publishEvent(
                                new com.agarly.backend.models.SSE("BOOKING_CREATED", List.of(ownerUsername)));
                    }
                }
            }
            return true;
        }
        return false;
    }

    public Transaction transferMoneyToOwner(Transaction paymentTx) {
        Booking booking = paymentTx.getBooking();
        if (booking == null || booking.getItem() == null)
            return null;

        User owner = booking.getItem().getOwner();
        if (owner == null)
            return null;

        // Calculate platform fee (5%) and owner earnings
        BigDecimal platformFee = paymentTx.getAmount().multiply(new BigDecimal("0.05"));
        BigDecimal ownerEarnings = paymentTx.getAmount().subtract(platformFee);

        // Update owner's wallet balance
        BigDecimal currentBalance = owner.getWalletBalance() != null ? owner.getWalletBalance() : BigDecimal.ZERO;
        owner.setWalletBalance(currentBalance.add(ownerEarnings));
        userRepository.save(owner);

        // Create earning transaction for owner
        Transaction earning = new Transaction();
        earning.setUser(owner);
        earning.setAmount(ownerEarnings);
        earning.setFee(platformFee);
        earning.setType(TransactionType.PAYOUT);
        earning.setStatus(TransactionStatus.COMPLETED);
        earning.setDescription("Rental income: " + booking.getItem().getTitle());
        earning.setReferenceNumber("EARN-" + System.currentTimeMillis());
        earning.setBooking(booking);
        earning.setCreatedAt(LocalDateTime.now(ZoneId.of("Africa/Cairo")));

        return transactionRepository.save(earning);
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

        String lastFour = dto.getCardNumber().replaceAll("\\s", "").substring(
                dto.getCardNumber().replaceAll("\\s", "").length() - 4);

        method.setLastFourDigits(lastFour);
        method.setCardType(detectCardType(dto.getCardNumber()));
        method.setDisplayName(method.getCardType() + " •••• " + lastFour);
        method.setExpiryMonth(dto.getExpiryMonth());
        method.setExpiryYear(dto.getExpiryYear());

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