package com.agarly.backend.controllers;

import com.agarly.backend.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @PostMapping("/charge")
    public void charge() {
        paymentService.charge();
    }

    @GetMapping("/history")
    public void getHistory() {
        paymentService.getHistory();
    }
}
