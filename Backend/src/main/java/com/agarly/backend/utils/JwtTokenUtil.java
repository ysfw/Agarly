package com.agarly.backend.utils;

import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenUtil {
    // Use same fixed secret key as JWTService
    @Value("${jwt.secret:YWdhcmx5LWFwcGxpY2F0aW9uLXNlY3JldC1rZXktMjAyNS12ZXJ5LWxvbmctYW5kLXNlY3VyZS1rZXk=}")
    private String secretKeyString;

    private static final long EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

    private SecretKey getSecretKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKeyString);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSecretKey())
                .compact();
    }

    public boolean validateToken(String token) {
        return !isTokenExpired(token);
    }

    public String extractEmail(String token) {
        JwtParser jwtParser = Jwts.parser()
                .verifyWith(getSecretKey())
                .build();

        return jwtParser.parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        JwtParser jwtParser = Jwts.parser()
                .verifyWith(getSecretKey())
                .build();

        return jwtParser.parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }

}
