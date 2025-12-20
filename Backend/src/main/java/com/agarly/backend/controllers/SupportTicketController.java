package com.agarly.backend.controllers;

import com.agarly.backend.models.SupportTicket;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.services.SupportTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/support")
public class SupportTicketController {
    @Autowired
    private SupportTicketService ticketService;

    @PostMapping("/tickets")
    public ResponseEntity<SupportTicket> createTicket(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody SupportTicket ticket) {

        return ResponseEntity.ok(
                ticketService.createSupportTicket(principal.getId(), ticket.getSubject(), ticket.getMessage())
        );
    }


    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicket>> getTickets(
            @AuthenticationPrincipal UserPrincipal principal) {

        return ResponseEntity.ok(
                ticketService.getUserTickets(principal.getId())
        );
    }

    @PutMapping("/admin/tickets/{id}/close")
    public ResponseEntity<SupportTicket> closeTicket(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ticketService.closeTicket(id)
        );
    }
}
