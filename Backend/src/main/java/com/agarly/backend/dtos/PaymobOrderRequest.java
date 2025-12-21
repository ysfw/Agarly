package com.agarly.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymobOrderRequest {
    private String auth_token;
    private String delivery_needed = "false";
    private String amount_cents; // "10000" for 100 EGP
    private String currency = "EGP";
    private List<Object> items = new ArrayList<>();
}
