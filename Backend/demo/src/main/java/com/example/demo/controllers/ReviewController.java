package com.example.demo.controllers;

import com.example.demo.models.Reviews;
import com.example.demo.repositories.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    // Ajouter un avis
    @PostMapping
    public ResponseEntity<Reviews> addReview(@RequestBody Reviews review) {
        review.setDateOfCreation(LocalDateTime.now());
        Reviews savedReview = reviewRepository.save(review);
        return ResponseEntity.ok(savedReview);
    }

    // Récupérer tous les avis
    @GetMapping
    public ResponseEntity<List<Reviews>> getAllReviews() {
        List<Reviews> reviews = reviewRepository.findAll();
        return ResponseEntity.ok(reviews);
    }

    // Récupérer un avis par ID
    @GetMapping("/{id}")
    public ResponseEntity<Reviews> getReviewById(@PathVariable int id) {
        Optional<Reviews> review = reviewRepository.findById(id);
        return review.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Mettre à jour un avis
    @PutMapping("/{id}")
    public ResponseEntity<Reviews> updateReview(@PathVariable int id, @RequestBody Reviews reviewDetails) {
        Optional<Reviews> optionalReview = reviewRepository.findById(id);
        if (optionalReview.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Reviews review = optionalReview.get();
        review.setDescription(reviewDetails.getDescription());
        review.setRating(reviewDetails.getRating());
        Reviews updatedReview = reviewRepository.save(review);
        return ResponseEntity.ok(updatedReview);
    }

    // Supprimer un avis
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable int id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Récupérer les avis par ID de supporter
    @GetMapping("/supporter/{supporterId}")
    public ResponseEntity<List<Reviews>> getReviewsBySupporter(@PathVariable int supporterId) {
        List<Reviews> reviews = reviewRepository.findBySupporterId(supporterId);
        return ResponseEntity.ok(reviews);
    }

    // Récupérer les avis par ID de match
    @GetMapping("/match/{matchId}")
    public ResponseEntity<List<Reviews>> getReviewsByMatch(@PathVariable int matchId) {
        List<Reviews> reviews = reviewRepository.findByMatchId(matchId);
        return ResponseEntity.ok(reviews);
    }

    // Récupérer les avis par rating (par exemple, les avis avec 5 étoiles)
    @GetMapping("/rating/{rating}")
    public ResponseEntity<List<Reviews>> getReviewsByRating(@PathVariable int rating) {
        List<Reviews> reviews = reviewRepository.findByRating(rating);
        return ResponseEntity.ok(reviews);
    }
}
