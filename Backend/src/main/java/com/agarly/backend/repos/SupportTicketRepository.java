package com.agarly.backend.repos;

import com.agarly.backend.models.Enums.TicketStatus;
import com.agarly.backend.models.SupportTicket;
import com.agarly.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByCreatedBy(User user);
    List<SupportTicket> findByStatus(TicketStatus status);
    long countByStatus(TicketStatus status);
}
