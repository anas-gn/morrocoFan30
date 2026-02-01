package com.example.demo.controllers;

import com.example.demo.hooks.SupporterDTO;
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

    // Récupérer le profil d'un supporter par ID (retourne un DTO)
    @GetMapping("/{id}")
    public ResponseEntity<SupporterDTO> getSupporterProfile(@PathVariable int id) {
        Supporters supporter = supporterRepository.findById(id);
        if (supporter == null) {
            return ResponseEntity.notFound().build();
        }
        SupporterDTO supporterDTO = convertToDTO(supporter);
        return ResponseEntity.ok(supporterDTO);
    }

    // Mettre à jour le profil d'un supporter (utilise un DTO pour la requête)
    @PutMapping("/{id}")
    public ResponseEntity<SupporterDTO> updateSupporterProfile(
            @PathVariable int id,
            @RequestBody SupporterDTO supporterDTO) {
        Supporters supporter = supporterRepository.findById(id);
        if (supporter == null) {
            return ResponseEntity.notFound().build();
        }

        // Mise à jour des champs modifiables à partir du DTO
        supporter.setName(supporterDTO.getName());
        supporter.setAge(supporterDTO.getAge());
        supporter.setEmail(supporterDTO.getEmail());
        supporter.setPhone(supporterDTO.getPhone());
        supporter.setCountry(supporterDTO.getCountry());
        // Ne pas exposer le mot de passe via le DTO

        Supporters updatedSupporter = supporterRepository.save(supporter);
        SupporterDTO updatedDTO = convertToDTO(updatedSupporter);
        return ResponseEntity.ok(updatedDTO);
    }

    // Supprimer un compte supporter (inchangé)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupporterAccount(@PathVariable int id) {
        if (!supporterRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        supporterRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Récupérer un supporter par email (retourne un DTO)
    @GetMapping("/email/{email}")
    public ResponseEntity<SupporterDTO> getSupporterByEmail(@PathVariable String email) {
        Supporters supporter = supporterRepository.findByEmail(email);
        if (supporter == null) {
            return ResponseEntity.notFound().build();
        }
        SupporterDTO supporterDTO = convertToDTO(supporter);
        return ResponseEntity.ok(supporterDTO);
    }

    // Méthode utilitaire pour convertir une entité Supporters en DTO
    private SupporterDTO convertToDTO(Supporters supporter) {
        SupporterDTO dto = new SupporterDTO();
        dto.setId(supporter.getId());
        dto.setName(supporter.getName());
        dto.setAge(supporter.getAge());
        dto.setEmail(supporter.getEmail());
        dto.setPhone(supporter.getPhone());
        dto.setCountry(supporter.getCountry());
        dto.setTotalPoints(supporter.getTotalPoints());
        return dto;
    }
}
