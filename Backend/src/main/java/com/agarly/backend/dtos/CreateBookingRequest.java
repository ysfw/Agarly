package com.agarly.backend.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateBookingRequest {
    private Long itemId;
    private LocalDate startDate;
    private LocalDate endDate;
    private java.time.LocalTime startTime;
    private java.time.LocalTime endTime;
}
