package com.agarly.backend.configs.filters;

import com.agarly.backend.services.JWTService;
import com.agarly.backend.services._UserDetailsService;
import com.agarly.backend.services._AdminDetailsService;
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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
                System.err.println("JWT SignatureException: Invalid signature - " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            } catch (ExpiredJwtException e) {
                System.err.println("JWT ExpiredJwtException: Token expired - " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            } catch (MalformedJwtException e) {
                System.err.println("JWT MalformedJwtException: Malformed token - " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            } catch (Exception e) {
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

            UserDetails user = null;

            // First, try to find in Admin table
            try {
                _AdminDetailsService adminService = context.getBean(_AdminDetailsService.class);
                if (adminService.adminExists(username)) {
                    user = adminService.loadUserByUsername(username);
                    System.out.println("Admin found in database: " + user.getUsername());
                }
            } catch (UsernameNotFoundException e) {
                System.out.println("Not found in admin table, trying user table...");
            } catch (Exception e) {
                System.out.println("Error checking admin table: " + e.getMessage());
            }

            // If not found in Admin table, try User table
            if (user == null) {
                try {
                    user = context.getBean(_UserDetailsService.class).loadUserByUsername(username);
                    System.out.println("User found in database: " + user.getUsername());
                } catch (UsernameNotFoundException e) {
                    System.err.println("User not found in either admin or user table: " + username);
                } catch (Exception e) {
                    System.err.println("Error loading user from database: " + e.getMessage());
                }
            }

            // Validate token and set authentication
            if (user != null) {
                if (jwtService.validateToken(jwtToken, user)) {
                    System.out.println("Token validated successfully!");
                    System.out.println("User authorities: " + user.getAuthorities());
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user, null, user.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authentication set in SecurityContext");
                } else {
                    System.err.println("Token validation failed!");
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
