package com.example.demo.controllers;

import com.example.demo.hooks.ResponsableDTO;
import com.example.demo.hooks.StadeDTO;
import com.example.demo.models.Responsables;
import com.example.demo.models.Stades;
import com.example.demo.repositories.ResponsableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    public ResponseEntity<ResponsableDTO> getResponsableById(@PathVariable int id) {
        Optional<Responsables> responsable = responsableRepository.findById(id);

        return responsable.map(r -> ResponseEntity.ok(convertToDTO(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    // GET - Nombre de stades gérés par chaque responsable
    @GetMapping("/stades/count")
    public ResponseEntity<Map<String, Object>> getStadesCountByResponsable() {
        List<Responsables> responsables = responsableRepository.findAll();

        Map<String, Object> stadesCountMap = responsables.stream()
                .collect(Collectors.toMap(
                        Responsables::getName,
                        responsable -> {
                            Map<String, Object> info = new HashMap<>();
                            info.put("responsableId", responsable.getId());
                            info.put("nombreStades",
                                    responsable.getStade() != null ? responsable.getStade().size() : 0);
                            info.put("email", responsable.getEmail());
                            info.put("country", responsable.getCountry());
                            return info;
                        }));

        return ResponseEntity.ok(stadesCountMap);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ResponsableDTO> getResponsableByEmail(@PathVariable String email) {
        Responsables responsable = responsableRepository.findByEmail(email);

        if (responsable != null) {
            return ResponseEntity.ok(convertToDTO(responsable));
        }

        return ResponseEntity.notFound().build();
    }

    // GET - Chercher des responsables par nom (recherche partielle)
    @GetMapping("/search/{name}")
    public ResponseEntity<List<ResponsableDTO>> searchResponsablesByName(@PathVariable String name) {
        List<Responsables> responsables = responsableRepository.findByNameContainingIgnoreCase(name);

        if (responsables != null && !responsables.isEmpty()) {
            List<ResponsableDTO> responsableDTOs = responsables.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responsableDTOs);
        }

        return ResponseEntity.ok(new ArrayList<>());
    }

    // POST - Ajouter un nouveau responsable
   
@PostMapping("/add")
public ResponseEntity<ResponsableDTO> addResponsable(@RequestBody Responsables responsable) {
    if (responsable.getPassword() != null && !responsable.getPassword().startsWith("$2a$")) {
        responsable.setPassword(encoder.encode(responsable.getPassword()));
    }
    Responsables saved = responsableRepository.save(responsable);
    return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(saved));
}

    // PUT - Mettre à jour un responsable existant
    @PutMapping("/update/{id}")
    public ResponseEntity<ResponsableDTO> updateResponsable(
            @PathVariable int id,
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
    @PatchMapping("/miseaj/{id}")
    public ResponseEntity<ResponsableDTO> patchResponsable(
            @PathVariable int id,
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
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteResponsable(@PathVariable int id) {
        if (responsableRepository.existsById(id)) {
            responsableRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE - Supprimer tous les responsables
    @DeleteMapping("/deleteAll/{id}")
    public ResponseEntity<Void> deleteAllResponsables() {
        responsableRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> countResponsables() {
        Integer count = (int) responsableRepository.count();
        return ResponseEntity.ok(count);
    }

    // GET - Récupérer les stades d'un responsable par ID
    @GetMapping("/{id}/stades")
    public ResponseEntity<List<StadeDTO>> getStadesByResponsableId(@PathVariable int id) {
        Optional<Responsables> responsable = responsableRepository.findById(id);

        if (responsable.isPresent()) {
            List<Stades> stades = responsable.get().getStade();

            if (stades != null && !stades.isEmpty()) {
                List<StadeDTO> stadeDTOs = stades.stream()
                        .map(this::convertStadeToDTO)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(stadeDTOs);
            }

            return ResponseEntity.ok(new ArrayList<>());
        }

        return ResponseEntity.notFound().build();
    }

    private StadeDTO convertStadeToDTO(Stades stade) {
        StadeDTO dto = new StadeDTO();
        dto.setId(stade.getId());
        dto.setName(stade.getName());
        dto.setCapacity(stade.getCapacity());
        dto.setCountry(stade.getCountry());
        dto.setAdresse(stade.getAdresse());
        dto.setImageUrl(stade.getImageUrl());
        dto.setVideoUrl(stade.getVideoUrl());
        dto.setDescription(stade.getDescription());
        dto.setDateOfConstruction(stade.getDateOfConstruction());

        if (stade.getCity() != null) {
            dto.setCityId(stade.getCity().getId());
            dto.setCityName(stade.getCity().getName());
        }

        if (stade.getResponsable() != null) {
            dto.setResponsableId(stade.getResponsable().getId());
            dto.setResponsable(stade.getResponsable().getName());
        }

        return dto;
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