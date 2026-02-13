package com.example.demo.controllers;

import com.example.demo.hooks.SupporterDTO;
import com.example.demo.models.Supporters;
import com.example.demo.repositories.SupporterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/supporters")
public class SupporterController {

    @Autowired
    private SupporterRepository supporterRepository;

    // Récupérer tous les supporters avec pagination
    @GetMapping("/all")
    public ResponseEntity<Page<SupporterDTO>> getAllSupporters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Supporters> supportersPage = supporterRepository.findAll(pageable);
        Page<SupporterDTO> dtoPage = supportersPage.map(this::convertToDTO);
        return ResponseEntity.ok(dtoPage);
    }

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

        supporter.setName(supporterDTO.getName());
        supporter.setAge(supporterDTO.getAge());
        supporter.setEmail(supporterDTO.getEmail());
        supporter.setPhone(supporterDTO.getPhone());
        supporter.setCountry(supporterDTO.getCountry());

        Supporters updatedSupporter = supporterRepository.save(supporter);
        SupporterDTO updatedDTO = convertToDTO(updatedSupporter);
        return ResponseEntity.ok(updatedDTO);
    }

    // Mise à jour partielle
    @PatchMapping("/{id}")
    public ResponseEntity<SupporterDTO> partialUpdateSupporter(
            @PathVariable int id,
            @RequestBody SupporterDTO supporterDTO) {
        Supporters supporter = supporterRepository.findById(id);
        if (supporter == null) {
            return ResponseEntity.notFound().build();
        }

        if (supporterDTO.getName() != null) {
            supporter.setName(supporterDTO.getName());
        }
        if (supporterDTO.getAge() != null) {
            supporter.setAge(supporterDTO.getAge());
        }
        if (supporterDTO.getEmail() != null) {
            supporter.setEmail(supporterDTO.getEmail());
        }
        if (supporterDTO.getPhone() != null) {
            supporter.setPhone(supporterDTO.getPhone());
        }
        if (supporterDTO.getCountry() != null) {
            supporter.setCountry(supporterDTO.getCountry());
        }

        Supporters updatedSupporter = supporterRepository.save(supporter);
        return ResponseEntity.ok(convertToDTO(updatedSupporter));
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
    public ResponseEntity<SupporterDTO> getSupporterByEmail(@PathVariable String email) {
        Supporters supporter = supporterRepository.findByEmail(email);
        if (supporter == null) {
            return ResponseEntity.notFound().build();
        }
        SupporterDTO supporterDTO = convertToDTO(supporter);
        return ResponseEntity.ok(supporterDTO);
    }

    // Rechercher des supporters par nom
    @GetMapping("/search/{name}")
    public ResponseEntity<List<SupporterDTO>> searchSupportersByName(
            @RequestParam String name) {
        List<Supporters> supporters = supporterRepository.findByNameContainingIgnoreCase(name);
        List<SupporterDTO> dtos = supporters.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Récupérer les supporters par pays
    @GetMapping("/country/{country}")
    public ResponseEntity<List<SupporterDTO>> getSupportersByCountry(@PathVariable String country) {
        List<Supporters> supporters = supporterRepository.findByCountry(country);
        List<SupporterDTO> dtos = supporters.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Récupérer le classement des supporters
    @GetMapping("/leaderboard")
    public ResponseEntity<List<SupporterDTO>> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalPoints"));
        Page<Supporters> topSupporters = supporterRepository.findAll(pageable);
        List<SupporterDTO> dtos = topSupporters.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Récupérer le nombre total de supporters
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalSupportersCount() {
        long count = supporterRepository.count();
        return ResponseEntity.ok(count);
    }

    // Récupérer les supporters par tranche d'âge
    @GetMapping("/ageRange")
    public ResponseEntity<List<SupporterDTO>> getSupportersByAgeRange(
            @RequestParam int minAge,
            @RequestParam int maxAge) {
        List<Supporters> supporters = supporterRepository.findByAgeBetween(minAge, maxAge);
        List<SupporterDTO> dtos = supporters.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Vérifier si un email existe déjà
    @GetMapping("/checkEmail/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        boolean exists = supporterRepository.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }

    // Récupérer le nombre de supporters par pays
    @GetMapping("/stats/byCountry")
    public ResponseEntity<Map<String, Long>> getSupportersCountByCountry() {
        List<Object[]> results = supporterRepository.countSupportersByCountry();

        Map<String, Long> countByCountry = results.stream()
                .collect(Collectors.toMap(
                        result -> (String) result[0],
                        result -> (Long) result[1]));

        return ResponseEntity.ok(countByCountry);
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