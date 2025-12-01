package com.agarly.backend.models;

import com.agarly.backend.services.UserService;
import lombok.Data;

@Data
public class JWTResponse {
    public JWTResponse(String token) {
        Token = token;
    }

    private String Token;
}
