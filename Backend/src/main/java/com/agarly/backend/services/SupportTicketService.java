package com.agarly.backend.services;

import com.agarly.backend.models.Enums.TicketStatus;
import com.agarly.backend.models.SupportTicket;
import com.agarly.backend.models.User;
import com.agarly.backend.repos.SupportTicketRepository;
import com.agarly.backend.repos.UserRepository;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupportTicketService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SupportTicketRepository supportTicketRepository;

    public SupportTicket createSupportTicket(Long userId, String subject, String message) {
        User user = userRepository.findById(userId).orElseThrow(()->new RuntimeException("User not found"));
        SupportTicket ticket = new SupportTicket();
        ticket.setSubject(subject);
        ticket.setMessage(message);
        ticket.setStatus(TicketStatus.PENDING);
        ticket.setCreatedBy(user);
        // Logic to save the support ticket to the database
        return supportTicketRepository.save(ticket);
    }

    public List<SupportTicket> getUserTickets(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()->new RuntimeException("User not found"));
        return supportTicketRepository.findByCreatedBy(user);
    }

    public SupportTicket closeTicket(Long ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new RuntimeException("Ticket already closed");
        }
        ticket.setStatus(TicketStatus.CLOSED);
        return supportTicketRepository.save(ticket);
    }
}
