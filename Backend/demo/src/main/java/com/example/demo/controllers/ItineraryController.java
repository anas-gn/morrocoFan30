
package com.example.demo.controllers;

import com.example.demo.repositories.AttractionRepository;
import com.example.demo.repositories.ItineraryRepository;
import com.example.demo.repositories.SupporterRepository;
import com.example.demo.models.Attractions;
import com.example.demo.models.Itineraries;
import com.example.demo.models.Supporters;
import com.example.demo.hooks.AttractionDTO;
import com.example.demo.hooks.ItineraryDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/itineraries")
@CrossOrigin(origins = "*") // ← IMPORTANT : Activer CORS
public class ItineraryController {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private SupporterRepository supporterRepository;

    @Autowired
    private AttractionRepository attractionRepository;

    @PostMapping("/add/{supporterId}")
    public ResponseEntity<?> addItinerary(
            @PathVariable int supporterId,
            @RequestBody Itineraries itinerary) {

        // Validation : supporter existe ?
        Supporters supporter = supporterRepository.findById(supporterId);
        if (supporter == null) {
            return ResponseEntity.badRequest().body("Supporter not found");
        }

        // Validation : itinéraire vide ?
        if (itinerary == null || itinerary.getTitle() == null || itinerary.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Title is required");
        }

        // Vérifier limite : un seul itinéraire par supporter
        List<Itineraries> existing = itineraryRepository.findBySupporterId(supporterId);
        if (!existing.isEmpty()) {
            return ResponseEntity.badRequest().body("You already have an itinerary");
        }

        // Créer l'itinéraire
        itinerary.setSupporter(supporter);
        Itineraries saved = itineraryRepository.save(itinerary);

        // Retourner le DTO de l'itinéraire créé
        return ResponseEntity.ok(convertToDTO(saved));
    }

    @GetMapping("/supporter/{id}")
    public List<ItineraryDTO> getItinerariesBySupporter(@PathVariable int id) {
        return itineraryRepository.findBySupporterId(id)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}/attractions")
    public ResponseEntity<List<AttractionDTO>> getItineraryAttractions(@PathVariable int id) {
        Itineraries itinerary = itineraryRepository.findById(id).orElse(null);

        if (itinerary == null) {
            return ResponseEntity.notFound().build();
        }

        List<AttractionDTO> attractions = itinerary.getAttractions()
                .stream()
                .map(this::convertAttractionToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(attractions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItineraryDTO> getItineraryById(@PathVariable int id) {
        Itineraries itinerary = itineraryRepository.findById(id).orElse(null);

        if (itinerary == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToDTO(itinerary));
    }

    @PostMapping("/{itineraryId}/add-attraction/{attractionId}")
    public ResponseEntity<?> addAttractionToItinerary(
            @PathVariable int itineraryId,
            @PathVariable int attractionId) {

        Itineraries itinerary = itineraryRepository.findById(itineraryId).orElse(null);
        Attractions attraction = attractionRepository.findById(attractionId).orElse(null);

        // Validation
        if (itinerary == null) {
            return ResponseEntity.badRequest().body("Itinerary not found");
        }
        if (attraction == null) {
            return ResponseEntity.badRequest().body("Attraction not found");
        }

        // Vérifier si déjà présent
        if (itinerary.getAttractions().contains(attraction)) {
            return ResponseEntity.badRequest().body("Attraction already in itinerary");
        }

        // Ajouter l'attraction
        itinerary.getAttractions().add(attraction);
        itineraryRepository.save(itinerary);

        return ResponseEntity.ok(true);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 6. RETIRER UNE ATTRACTION D'UN ITINÉRAIRE
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ✅ VERSION AMÉLIORÉE
     * - Meilleure gestion des erreurs
     * - Vérifie que l'attraction est bien dans l'itinéraire
     */
    @DeleteMapping("/{itineraryId}/remove-attraction/{attractionId}")
    public ResponseEntity<?> removeAttractionFromItinerary(
            @PathVariable int itineraryId,
            @PathVariable int attractionId) {

        Itineraries itinerary = itineraryRepository.findById(itineraryId).orElse(null);
        Attractions attraction = attractionRepository.findById(attractionId).orElse(null);

        // Validation
        if (itinerary == null) {
            return ResponseEntity.badRequest().body("Itinerary not found");
        }
        if (attraction == null) {
            return ResponseEntity.badRequest().body("Attraction not found");
        }

        // Vérifier si l'attraction est dans l'itinéraire
        if (!itinerary.getAttractions().contains(attraction)) {
            return ResponseEntity.badRequest().body("Attraction not in itinerary");
        }

        // Retirer l'attraction
        itinerary.getAttractions().remove(attraction);
        itineraryRepository.save(itinerary);

        return ResponseEntity.ok(true);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 7. METTRE À JOUR UN ITINÉRAIRE (pour la date notamment)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ✅ NOUVEAU : Endpoint pour mettre à jour un itinéraire
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateItinerary(
            @PathVariable int id,
            @RequestBody Itineraries updatedItinerary) {

        Itineraries existing = itineraryRepository.findById(id).orElse(null);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        // Mettre à jour les champs modifiables
        if (updatedItinerary.getTitle() != null && !updatedItinerary.getTitle().trim().isEmpty()) {
            existing.setTitle(updatedItinerary.getTitle());
        }
        if (updatedItinerary.getDescription() != null) {
            existing.setDescription(updatedItinerary.getDescription());
        }
        if (updatedItinerary.getDateToGo() != null) {
            existing.setDateToGo(updatedItinerary.getDateToGo());
        }

        Itineraries saved = itineraryRepository.save(existing);
        return ResponseEntity.ok(convertToDTO(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItinerary(@PathVariable int id) {
        Itineraries itinerary = itineraryRepository.findById(id).orElse(null);

        if (itinerary == null) {
            return ResponseEntity.notFound().build();
        }

        itineraryRepository.delete(itinerary);
        return ResponseEntity.ok().body("Itinerary deleted successfully");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MÉTHODES DE CONVERSION DTO
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Convertir Itineraries → ItineraryDTO
     */
    private ItineraryDTO convertToDTO(Itineraries it) {
        ItineraryDTO dto = new ItineraryDTO();
        dto.setId(it.getId());
        dto.setTitle(it.getTitle());
        dto.setDescription(it.getDescription());
        dto.setDateToGo(it.getDateToGo());
        dto.setSupporterId(it.getSupporter().getId());
        dto.setSupportName(it.getSupporter().getName());
        // Optionnel : ajouter le nombre d'attractions
        // dto.setAttractionsCount(it.getAttractions().size());
        return dto;
    }

    /**
     * ✅ VERSION AMÉLIORÉE
     * IMPORTANT : Ajouter imageUrl dans le DTO
     */
    private AttractionDTO convertAttractionToDTO(Attractions attraction) {
        AttractionDTO dto = new AttractionDTO();
        dto.setId(attraction.getId());
        dto.setName(attraction.getName());
        dto.setType(attraction.getType());
        dto.setPriceProxim(attraction.getPriceProxim());
        dto.setDescription(attraction.getDescription());
        dto.setAddress(attraction.getAddress());
        dto.setHoureOfOpening(attraction.getHoureOfOpening());
        dto.setHoureOfClosing(attraction.getHoureOfClosing());
        dto.setLatitude(attraction.getLatitude());
        dto.setLongitude(attraction.getLongitude());

        // ✅ CRITIQUE : Ajouter l'image URL
        dto.setImageUrl(attraction.getImageUrl());

        return dto;
    }
}
