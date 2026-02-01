package com.example.demo.controllers;

import com.example.demo.models.Supporters;
import com.example.demo.repositories.SupporterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/supporters")
public class SupporterController {

    @Autowired
    private SupporterRepository supporterRepository;

    // Récupérer le profil d'un supporter par ID
    @GetMapping("/{id}")
    public ResponseEntity<Supporters> getSupporterProfile(@PathVariable int id) {
        Supporters supporter = supporterRepository.findById(id);
        if (supporter == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(supporter);
    }

    // Mettre à jour le profil d'un supporter
    @PutMapping("/{id}")
    public ResponseEntity<Supporters> updateSupporterProfile(
            @PathVariable int id,
            @RequestBody Supporters supporterDetails) {
        Supporters supporter = supporterRepository.findById(id);
        if (supporter == null) {
            return ResponseEntity.notFound().build();
        }

        // Mise à jour des champs modifiables
        supporter.setName(supporterDetails.getName());
        supporter.setAge(supporterDetails.getAge());
        supporter.setEmail(supporterDetails.getEmail());
        supporter.setPhone(supporterDetails.getPhone());
        supporter.setPassword(supporterDetails.getPassword()); // À sécuriser en pratique
        supporter.setCountry(supporterDetails.getCountry());

        Supporters updatedSupporter = supporterRepository.save(supporter);
        return ResponseEntity.ok(updatedSupporter);
    }

    // Supprimer un compte supporter
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupporterAccount(@PathVariable int id) {
        if (!supporterRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        supporterRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Récupérer un supporter par email
    @GetMapping("/email/{email}")
    public ResponseEntity<Supporters> getSupporterByEmail(@PathVariable String email) {
        Supporters supporter = supporterRepository.findByEmail(email);
        if (supporter == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(supporter);
    }
}
