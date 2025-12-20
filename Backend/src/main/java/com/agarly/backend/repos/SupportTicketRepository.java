package com.agarly.backend.repos;

import com.agarly.backend.models.SupportTicket;
import com.agarly.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    public List<SupportTicket> findByCreatedBy(User user);
}
