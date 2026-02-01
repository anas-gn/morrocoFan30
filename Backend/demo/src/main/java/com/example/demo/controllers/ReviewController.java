package com.example.demo.controllers;

import com.example.demo.hooks.ReviewDTO;
import com.example.demo.models.Reviews;
import com.example.demo.models.Supporters;
import com.example.demo.models.Matches;
import com.example.demo.repositories.ReviewRepository;
import com.example.demo.repositories.SupporterRepository;
import com.example.demo.repositories.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private SupporterRepository supporterRepository;

    @Autowired
    private MatchRepository matchRepository;

    // Ajouter un avis (retourne un DTO)
    @PostMapping
    public ResponseEntity<ReviewDTO> addReview(@RequestBody ReviewDTO reviewDTO) {
        // Récupérer le supporter
        Supporters supporter = supporterRepository.findById(reviewDTO.getSupporterId());
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supporter introuvable");
        }

        // Récupérer le match
        Matches match = matchRepository.findById(reviewDTO.getMatchId());
        if (match == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Match introuvable");
        }

        // Créer l'avis
        Reviews review = new Reviews();
        review.setDescription(reviewDTO.getDescription());
        review.setRating(reviewDTO.getRating());
        review.setDateOfCreation(LocalDateTime.now());
        review.setSupporter(supporter);
        review.setMatch(match);

        Reviews savedReview = reviewRepository.save(review);
        return ResponseEntity.ok(convertToDTO(savedReview));
    }

    // Récupérer tous les avis (retourne une liste de DTO)
    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        List<Reviews> reviews = reviewRepository.findAll();
        List<ReviewDTO> reviewDTOs = reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(reviewDTOs);
    }

    // Récupérer un avis par ID (retourne un DTO)
    @GetMapping("/{id}")
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable int id) {
        Reviews review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avis introuvable"));
        return ResponseEntity.ok(convertToDTO(review));
    }

    // Mettre à jour un avis (retourne un DTO)
    @PutMapping("/{id}")
    public ResponseEntity<ReviewDTO> updateReview(@PathVariable int id, @RequestBody ReviewDTO reviewDTO) {
        Reviews review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avis introuvable"));

        // Récupérer le match
        Matches match = matchRepository.findById(reviewDTO.getMatchId());
        if (match == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Match introuvable");
        }

        review.setDescription(reviewDTO.getDescription());
        review.setRating(reviewDTO.getRating());
        review.setMatch(match);

        Reviews updatedReview = reviewRepository.save(review);
        return ResponseEntity.ok(convertToDTO(updatedReview));
    }

    // Supprimer un avis
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable int id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Avis introuvable");
        }
        reviewRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Récupérer les avis par ID de supporter (retourne une liste de DTO)
    @GetMapping("/supporter/{supporterId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsBySupporter(@PathVariable int supporterId) {
        Supporters supporter = supporterRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supporter introuvable");
        }
        List<Reviews> reviews = reviewRepository.findBySupporterId(supporterId);
        List<ReviewDTO> reviewDTOs = reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(reviewDTOs);
    }

    // Récupérer les avis par ID de match (retourne une liste de DTO)
    @GetMapping("/match/{matchId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByMatch(@PathVariable int matchId) {
        List<Reviews> reviews = reviewRepository.findByMatchId(matchId);
        List<ReviewDTO> reviewDTOs = reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(reviewDTOs);
    }

    // Récupérer les avis par rating (retourne une liste de DTO)
    @GetMapping("/rating/{rating}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByRating(@PathVariable int rating) {
        List<Reviews> reviews = reviewRepository.findByRating(rating);
        List<ReviewDTO> reviewDTOs = reviews.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(reviewDTOs);
    }

    // Méthode utilitaire pour convertir une entité Reviews en DTO
    private ReviewDTO convertToDTO(Reviews review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setDescription(review.getDescription());
        dto.setRating(review.getRating());
        dto.setDateOfCreation(review.getDateOfCreation());
        dto.setSupporterId(review.getSupporter().getId());
        dto.setSupporterName(review.getSupporter().getName());
        dto.setMatchId(review.getMatch().getId());
        return dto;
    }
}
