package com.agarly.backend.controllers;

import com.agarly.backend.dtos.*;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<InitiatePaymentResponse> initiatePayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody InitiatePaymentRequest request) {

        InitiatePaymentResponse response = paymentService.initiatePayment(principal.getId(), request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "hmac", required = false) String hmacHeader) {

        boolean success = paymentService.handleWebhook(payload, hmacHeader);

        if (success) {
            return ResponseEntity.ok(Map.of("status", "received"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "failed"));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestParam Map<String, String> params) {
        boolean verified = paymentService.verifyPayment(params);
        return ResponseEntity.ok(Map.of("verified", verified));
    }

    @GetMapping("/methods")
    public ResponseEntity<List<PaymentMethodDTO>> getPaymentMethods(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<PaymentMethodDTO> methods = paymentService.getPaymentMethods(principal.getId());
        return ResponseEntity.ok(methods);
    }

    @PostMapping("/methods")
    public ResponseEntity<PaymentMethodDTO> addPaymentMethod(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody PaymentMethodDTO request) {

        PaymentMethodDTO created = paymentService.addPaymentMethod(principal.getId(), request);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/methods/{id}")
    public ResponseEntity<Map<String, String>> removePaymentMethod(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        paymentService.removePaymentMethod(principal.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Payment method removed successfully"));
    }

    @PatchMapping("/methods/{id}/default")
    public ResponseEntity<PaymentMethodDTO> setDefaultPaymentMethod(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        PaymentMethodDTO updated = paymentService.setDefaultPaymentMethod(principal.getId(), id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/charge")
    public ResponseEntity<TransactionDTO> charge(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ChargeRequest request) {

        TransactionDTO transaction = paymentService.charge(principal.getId(), request);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<TransactionDTO>> getTransactionHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<TransactionDTO> history = paymentService.getTransactionHistory(
                principal.getId(),
                PageRequest.of(page, size));
        return ResponseEntity.ok(history);
    }
}