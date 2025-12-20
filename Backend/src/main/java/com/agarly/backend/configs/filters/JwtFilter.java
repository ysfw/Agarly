package com.agarly.backend.configs.filters;

import com.agarly.backend.services.JWTService;
import com.agarly.backend.services._UserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    JWTService jwtService;
    @Autowired
    ApplicationContext context;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String jwtToken = null;
        String username = null;

        System.out.println("=== JwtFilter Debug ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Request Method: " + request.getMethod());
        System.out.println("Authorization Header exists: " + (authHeader != null));

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
            System.out.println("Token extracted (first 50 chars): "
                    + jwtToken.substring(0, Math.min(50, jwtToken.length())) + "...");

            try {
                // Try to extract username from token
                username = jwtService.extractUsername(jwtToken);
                System.out.println("Username extracted from token: " + username);
            } catch (SignatureException e) {
                // Token was signed with a different key (e.g., server restarted)
                // Don't set authentication - let SecurityConfig handle authorization
                // For public routes: request proceeds (permitAll)
                // For protected routes: request is blocked (authenticated required)
                System.err.println("JWT SignatureException: Invalid signature - " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            } catch (ExpiredJwtException e) {
                // Token has expired
                System.err.println("JWT ExpiredJwtException: Token expired - " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            } catch (MalformedJwtException e) {
                // Token is not properly formatted
                System.err.println("JWT MalformedJwtException: Malformed token - " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            } catch (Exception e) {
                // Any other JWT-related exception
                System.err.println("JWT Exception: " + e.getClass().getName() + " - " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            }
        } else {
            System.out.println("No Bearer token found in Authorization header");
        }

        // If we successfully extracted a username, try to authenticate
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("Looking up user in database: " + username);
            try {
                UserDetails user = context.getBean(_UserDetailsService.class).loadUserByUsername(username);
                System.out.println("User found in database: " + user.getUsername());
                if (jwtService.validateToken(jwtToken, user)) {
                    System.out.println("Token validated successfully!");
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user, null, user.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authentication set in SecurityContext");
                } else {
                    System.err.println("Token validation failed!");
                }
            } catch (Exception e) {
                System.err.println("Error loading user from database: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
