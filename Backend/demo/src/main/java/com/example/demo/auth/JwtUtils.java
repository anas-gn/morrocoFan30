package com.example.demo.auth;

import com.example.demo.models.Supporter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret:your-secret-key}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private int jwtExpiration;

    public String generateToken(Supporter supporter) {
        return Jwts.builder()
                .setSubject(String.valueOf(supporter.getId()))
                .claim("type", "SUPPORTER")
                .claim("email", supporter.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public int getUserIdFromToken(String token) {
        try {
            return Integer.parseInt(getAllClaimsFromToken(token).getSubject());
        } catch (Exception e) {
            return -1;
        }
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
 {
    
}
}