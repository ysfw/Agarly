package com.agarly.backend.models;

import com.agarly.backend.services.UserService;
import lombok.Data;

@Data
public class JWTResponse {
    private String Token;
    public JWTResponse(String token) {
        Token = token;
    }

}
