package com.agarly.backend.controllers;

import com.agarly.backend.models.SupportTicket;
import com.agarly.backend.services.SupportTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/support")
public class SupportTicketController {
    @Autowired
    private SupportTicketService ticketService;

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(
            @RequestParam Long userId,
            @RequestParam String subject,
            @RequestParam String message) {

        return ResponseEntity.ok(
                ticketService.createSupportTicket(userId, subject, message)
        );
    }

    @GetMapping("/tickets/my")
    public ResponseEntity<List<SupportTicket>> getMyTickets(
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                ticketService.getUserTickets(userId)
        );
    }

    @PutMapping("/tickets/{id}/close")
    public ResponseEntity<SupportTicket> closeTicket(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ticketService.closeTicket(id)
        );
    }
}
