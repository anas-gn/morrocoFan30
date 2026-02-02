package com.example.demo.controllers;

import com.example.demo.hooks.ResponsableDTO;
import com.example.demo.models.Responsables;
import com.example.demo.repositories.ResponsableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/responsables")
@CrossOrigin(origins = "*")
public class ResponsableController {

    @Autowired
    private ResponsableRepository responsableRepository;

    // GET - Récupérer tous les responsables
    @GetMapping
    public ResponseEntity<List<ResponsableDTO>> getAllResponsables() {
        List<Responsables> responsables = responsableRepository.findAll();
        List<ResponsableDTO> responsableDTOs = responsables.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responsableDTOs);
    }

    // GET - Récupérer un responsable par ID
    @GetMapping("/{id}")
    public ResponseEntity<ResponsableDTO> getResponsableById(@PathVariable Integer id) {
        Optional<Responsables> responsable = responsableRepository.findById(id);

        return responsable.map(r -> ResponseEntity.ok(convertToDTO(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    // POST - Ajouter un nouveau responsable
    @PostMapping
    public ResponseEntity<ResponsableDTO> addResponsable(@RequestBody Responsables responsable) {
        Responsables savedResponsable = responsableRepository.save(responsable);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedResponsable));
    }

    // PUT - Mettre à jour un responsable existant
    @PutMapping("/{id}")
    public ResponseEntity<ResponsableDTO> updateResponsable(
            @PathVariable Integer id,
            @RequestBody Responsables responsable) {

        Optional<Responsables> existingResponsable = responsableRepository.findById(id);

        if (existingResponsable.isPresent()) {
            Responsables existing = existingResponsable.get();
            existing.setName(responsable.getName());
            existing.setAge(responsable.getAge());
            existing.setEmail(responsable.getEmail());
            existing.setPhone(responsable.getPhone());
            existing.setCountry(responsable.getCountry());
            existing.setImageUrl(responsable.getImageUrl());

            Responsables updatedResponsable = responsableRepository.save(existing);
            return ResponseEntity.ok(convertToDTO(updatedResponsable));
        }

        return ResponseEntity.notFound().build();
    }

    // PATCH - Mise à jour
    @PatchMapping("/{id}")
    public ResponseEntity<ResponsableDTO> patchResponsable(
            @PathVariable Integer id,
            @RequestBody Responsables responsable) {

        Optional<Responsables> existingResponsable = responsableRepository.findById(id);

        if (existingResponsable.isPresent()) {
            Responsables existing = existingResponsable.get();

            if (responsable.getName() != null) {
                existing.setName(responsable.getName());
            }
            if (responsable.getAge() != null) {
                existing.setAge(responsable.getAge());
            }
            if (responsable.getEmail() != null) {
                existing.setEmail(responsable.getEmail());
            }
            if (responsable.getPhone() != null) {
                existing.setPhone(responsable.getPhone());
            }
            if (responsable.getCountry() != null) {
                existing.setCountry(responsable.getCountry());
            }
            if (responsable.getImageUrl() != null) {
                existing.setImageUrl(responsable.getImageUrl());
            }

            Responsables updatedResponsable = responsableRepository.save(existing);
            return ResponseEntity.ok(convertToDTO(updatedResponsable));
        }

        return ResponseEntity.notFound().build();
    }

    // DELETE - Supprimer un responsable par ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResponsable(@PathVariable Integer id) {
        if (responsableRepository.existsById(id)) {
            responsableRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE - Supprimer tous les responsables
    @DeleteMapping
    public ResponseEntity<Void> deleteAllResponsables() {
        responsableRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countResponsables() {
        long count = responsableRepository.count();
        return ResponseEntity.ok(count);
    }

    // Méthode helper pour convertir Entity vers DTO
    private ResponsableDTO convertToDTO(Responsables responsable) {
        ResponsableDTO dto = new ResponsableDTO(
                responsable.getName(),
                responsable.getAge(),
                responsable.getEmail(),
                responsable.getPhone(),
                responsable.getCountry(),
                responsable.getImageUrl());
        dto.setId(responsable.getId());
        return dto;
    }
}