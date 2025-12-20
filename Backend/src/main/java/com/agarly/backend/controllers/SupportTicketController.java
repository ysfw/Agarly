package com.agarly.backend.controllers;

import com.agarly.backend.models.SupportTicket;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.services.SupportTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/support/tickets")
public class SupportTicketController {
    @Autowired
    private SupportTicketService ticketService;

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody SupportTicket ticket) {

        return ResponseEntity.ok(
                ticketService.createSupportTicket(principal.getId(), ticket.getSubject(), ticket.getMessage())
        );
    }


    @GetMapping
    public ResponseEntity<List<SupportTicket>> getTickets(
            @AuthenticationPrincipal UserPrincipal principal) {

        return ResponseEntity.ok(
                ticketService.getUserTickets(principal.getId())
        );
    }

}
