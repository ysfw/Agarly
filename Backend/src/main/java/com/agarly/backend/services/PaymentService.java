package com.agarly.backend.services;

import com.agarly.backend.repos.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
    @Autowired
    private TransactionRepository transactionRepository;

    public void charge() {
        // Integration with Gateway
    }

    public void getHistory() {
        // Retrieve history
    }
}
