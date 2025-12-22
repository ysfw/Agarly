package com.agarly.backend.configs;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        // Check if there's a JWT error attribute set by the filter
        String jwtError = (String) request.getAttribute("jwtError");
        
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        
        if (jwtError != null) {
            response.getWriter().write("{\"error\": \"" + jwtError + "\"}");
        } else {
            response.getWriter().write("{\"error\": \"Unauthorized\"}");
        }
    }
}
