package com.agarly.backend.repos;

import com.agarly.backend.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByBorrowerId(Long id);
    List<Booking> findByItem_OwnerId(Long id);
}
