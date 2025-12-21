package com.agarly.backend.dtos;
import com.agarly.backend.models.Enums.TransactionStatus;
import com.agarly.backend.models.Enums.TransactionType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionDTO {
    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private TransactionStatus status;
    private String description;
    private String referenceNumber;
    private LocalDateTime createdAt;
}