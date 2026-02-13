package com.example.demo.controllers;

import com.example.demo.auth.JwtUtils;
import com.example.demo.auth.SessionManager;
import com.example.demo.auth.TokenManager;
import com.example.demo.models.Responsables;
import com.example.demo.models.Supporters;
import com.example.demo.repositories.ResponsableRepository;
import com.example.demo.repositories.SupporterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private SupporterRepository   supporterRepository;
    @Autowired private ResponsableRepository responsableRepository;
    @Autowired private JwtUtils              jwtUtils;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ──────────────────────────── SUPPORTER ────────────────────────────────

    @PostMapping("/supporter/register")
    public ResponseEntity<?> registerSupporter(@RequestBody Supporters req) {

        if (supporterRepository.findByEmail(req.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email déjà utilisé"));
        }

        req.setPassword(encoder.encode(req.getPassword()));
        req.setTotalPoints(0);
        Supporters saved = supporterRepository.save(req);

        String token = jwtUtils.generateToken(saved);
        TokenManager.saveToken(token);
        TokenManager.saveSupporterId(saved.getId());

        SessionManager.getInstance().setCurrentSupporter(saved);
        SessionManager.getInstance().setSupporterSession(
                token, saved.getName(), saved.getEmail(),
                saved.getPhone(), saved.getCountry(),
                saved.getAge(), saved.getTotalPoints(), saved.getId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "token",  token,
                "type",   "SUPPORTER",
                "id",     saved.getId(),
                "name",   saved.getName(),
                "email",  saved.getEmail()
        ));
    }

    @PostMapping("/supporter/login")
    public ResponseEntity<?> loginSupporter(@RequestBody Map<String, String> req) {

        String email    = req.get("email");
        String password = req.get("password");

        Supporters supporter = supporterRepository.findByEmail(email);

        if (supporter == null || !encoder.matches(password, supporter.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Email ou mot de passe incorrect"));
        }

        String token = jwtUtils.generateToken(supporter);
        TokenManager.saveToken(token);
        TokenManager.saveSupporterId(supporter.getId());

        SessionManager.getInstance().setCurrentSupporter(supporter);
        SessionManager.getInstance().setSupporterSession(
                token, supporter.getName(), supporter.getEmail(),
                supporter.getPhone(), supporter.getCountry(),
                supporter.getAge(), supporter.getTotalPoints(), supporter.getId()
        );

        return ResponseEntity.ok(Map.of(
                "token",  token,
                "type",   "SUPPORTER",
                "id",     supporter.getId(),
                "name",   supporter.getName(),
                "email",  supporter.getEmail()
        ));
    }

    // ──────────────────────────── RESPONSABLE ──────────────────────────────

    @PostMapping("/responsable/register")
    public ResponseEntity<?> registerResponsable(@RequestBody Responsables req) {

        if (responsableRepository.findByEmail(req.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email déjà utilisé"));
        }

        req.setPassword(encoder.encode(req.getPassword())); // ✅ correct
        Responsables saved = responsableRepository.save(req);

        String token = jwtUtils.generateToken(saved);
        TokenManager.saveToken(token);

        SessionManager.getInstance().setCurrentResponsable(saved);
        SessionManager.getInstance().setResponsableSession(
                token, saved.getName(), saved.getEmail(),
                saved.getPhone(), saved.getCountry(),
                saved.getAge(), saved.getImageUrl(), saved.getId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "token",  token,
                "type",   "RESPONSABLE",
                "id",     saved.getId(),
                "name",   saved.getName(),
                "email",  saved.getEmail()
        ));
    }

    @PostMapping("/responsable/login")
    public ResponseEntity<?> loginResponsable(@RequestBody Map<String, String> req) {

        String email    = req.get("email");
        String password = req.get("password");

        Responsables responsable = responsableRepository.findByEmail(email);

        if (responsable == null || !encoder.matches(password, responsable.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Email ou mot de passe incorrect"));
        }

        String token = jwtUtils.generateToken(responsable);
        TokenManager.saveToken(token);

        SessionManager.getInstance().setCurrentResponsable(responsable);
        SessionManager.getInstance().setResponsableSession(
                token, responsable.getName(), responsable.getEmail(),
                responsable.getPhone(), responsable.getCountry(),
                responsable.getAge(), responsable.getImageUrl(), responsable.getId()
        );

        return ResponseEntity.ok(Map.of(
                "token",  token,
                "type",   "RESPONSABLE",
                "id",     responsable.getId(),
                "name",   responsable.getName(),
                "email",  responsable.getEmail()
        ));
    }

    // ──────────────────────────── LOGOUT (commun) ──────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Token manquant"));
        }

        // Nettoyer SessionManager + TokenManager
        SessionManager.getInstance().logout();
        TokenManager.clearAllTokenData();

        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }
}