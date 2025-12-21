package com.agarly.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.minidev.json.JSONObject;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymobKeyRequest {
    private String auth_token;
    private String amount_cents;
    private String expiration = "3600";
    private String order_id;
    private JSONObject billing_data;
    private String currency = "EGP";
    private String integration_id; // THIS IS THE IMPORTANT PART
}