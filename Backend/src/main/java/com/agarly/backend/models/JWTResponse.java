package com.agarly.backend.models;

import com.agarly.backend.services.UserService;
import lombok.Data;

@Data
public class JWTResponse {
    private String Token;
    private boolean verified;
    private String username;
    private String email;
    
    public JWTResponse(String token) {
        Token = token;
    }
    
    public JWTResponse(String token, boolean verified, String username, String email) {
        Token = token;
        this.verified = verified;
        this.username = username;
        this.email = email;
    }
}
