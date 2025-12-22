package com.agarly.backend.dtos;

import com.agarly.backend.models.Enums.BookingStatus;
import lombok.Data;

@Data
public class UpdateBookingRequest {
    private BookingStatus status;
}
