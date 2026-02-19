package com.example.demo.controllers;

import com.example.demo.models.Cultures;
import com.example.demo.models.Teams;
import com.example.demo.models.Images;
import com.example.demo.repositories.CultureRepository;
import com.example.demo.repositories.TeamRepository;
import com.example.demo.repositories.ImageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cultures")
public class CultureController {

    @Autowired
    private CultureRepository culturesRepository;

    @Autowired
    private TeamRepository teamsRepository;

    @Autowired
    private ImageRepository imagesRepository;

   
     //  GET /api/cultures
     //  Récupérer toutes les cultures
     
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCultures() {
        List<Cultures> cultures = culturesRepository.findAll();
        return ResponseEntity.ok(
                cultures.stream()
                        .map(this::mapCultureToResponse)
                        .collect(Collectors.toList())
        );
    }

    
     // GET /api/cultures/{id}
     //  Récupérer une culture par ID
     
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCultureById(@PathVariable Integer id) {
        Optional<Cultures> culture = culturesRepository.findById(id);
        if (culture.isPresent()) {
            return ResponseEntity.ok(mapCultureToResponse(culture.get()));
        }
        return ResponseEntity.notFound().build();
    }

    
     // GET /api/cultures/team/{teamId}
     // Récupérer les cultures d'une équipe
     
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<Map<String, Object>>> getCulturesByTeam(@PathVariable Integer teamId) {
        List<Cultures> cultures = culturesRepository.findByTeamId(teamId);
        return ResponseEntity.ok(
                cultures.stream()
                        .map(this::mapCultureToResponse)
                        .collect(Collectors.toList())
        );
    }

     //  POST /api/cultures
     //  Créer une nouvelle culture
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createCulture(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Vérifier que l'équipe existe
            Integer teamId = (Integer) request.get("teamId");
            Optional<Teams> team = teamsRepository.findById(teamId);
            if (!team.isPresent()) {
                response.put("success", false);
                response.put("message", "Équipe non trouvée");
                return ResponseEntity.badRequest().body(response);
            }

            // Créer la culture
            Cultures culture = new Cultures();
            culture.setTitle((String) request.get("title"));
            culture.setAuthor((String) request.get("author"));
            culture.setDescription((String) request.get("description"));
            culture.setDetail((String) request.get("detail"));
            culture.setImageUrl((String) request.get("imageUrl"));
            culture.setTeam(team.get());
            culture.setDateOfCreation(LocalDateTime.now());

            Cultures savedCulture = culturesRepository.save(culture);

            
            @SuppressWarnings("unchecked")
            List<String> additionalImages = (List<String>) request.get("additionalImages");
            if (additionalImages != null && !additionalImages.isEmpty()) {
                for (String imageUrl : additionalImages) {
                    Images image = new Images();
                    image.setImageUrl(imageUrl);
                    image.setType("culture");
                    image.setOwnerID(savedCulture.getId());
                    imagesRepository.save(image);
                }
            }

            response.put("success", true);
            response.put("message", "Culture créée avec succès");
            response.put("data", mapCultureToResponse(savedCulture));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la création: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    
    // PUT /api/cultures/{id}
    // Mettre à jour une culture
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCulture(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Cultures> existingCulture = culturesRepository.findById(id);
            if (!existingCulture.isPresent()) {
                response.put("success", false);
                response.put("message", "Culture non trouvée");
                return ResponseEntity.notFound().build();
            }

            Cultures culture = existingCulture.get();

           
            if (request.containsKey("title")) {
                culture.setTitle((String) request.get("title"));
            }
            if (request.containsKey("author")) {
                culture.setAuthor((String) request.get("author"));
            }
            if (request.containsKey("description")) {
                culture.setDescription((String) request.get("description"));
            }
            if (request.containsKey("detail")) {
                culture.setDetail((String) request.get("detail"));
            }
            if (request.containsKey("imageUrl")) {
                culture.setImageUrl((String) request.get("imageUrl"));
            }

            
            if (request.containsKey("teamId")) {
                Integer teamId = (Integer) request.get("teamId");
                Optional<Teams> team = teamsRepository.findById(teamId);
                if (team.isPresent()) {
                    culture.setTeam(team.get());
                } else {
                    response.put("success", false);
                    response.put("message", "Équipe non trouvée");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            Cultures updatedCulture = culturesRepository.save(culture);

            response.put("success", true);
            response.put("message", "Culture mise à jour avec succès");
            response.put("data", mapCultureToResponse(updatedCulture));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la mise à jour: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    
     // DELETE /api/cultures/{id}
     // Supprimer une culture
     
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCulture(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Cultures> culture = culturesRepository.findById(id);
            if (!culture.isPresent()) {
                response.put("success", false);
                response.put("message", "Culture non trouvée");
                return ResponseEntity.notFound().build();
            }

         
            imagesRepository.deleteByTypeAndOwnerID("culture", id);

            
            culturesRepository.deleteById(id);

            response.put("success", true);
            response.put("message", "Culture supprimée avec succès");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

 

  
     // POST /api/cultures/{cultureId}/images
     // Ajouter des images supplémentaires à une culture existante
     
    @PostMapping("/{cultureId}/images")
    public ResponseEntity<Map<String, Object>> addImagesToCulture(
            @PathVariable Integer cultureId,
            @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Vérifier que la culture existe
            Optional<Cultures> existingCulture = culturesRepository.findById(cultureId);
            if (!existingCulture.isPresent()) {
                response.put("success", false);
                response.put("message", "Culture non trouvée");
                return ResponseEntity.notFound().build();
            }

        
            @SuppressWarnings("unchecked")
            List<String> imageUrls = (List<String>) request.get("imageUrls");
            
            if (imageUrls == null || imageUrls.isEmpty()) {
                response.put("success", false);
                response.put("message", "Aucune image fournie");
                return ResponseEntity.badRequest().body(response);
            }

           
            for (String imageUrl : imageUrls) {
                Images image = new Images();
                image.setImageUrl(imageUrl);
                image.setType("culture");
                image.setOwnerID(cultureId);
                imagesRepository.save(image);
            }

            response.put("success", true);
            response.put("message", imageUrls.size() + " image(s) ajoutée(s) avec succès");
            response.put("data", mapCultureToResponse(existingCulture.get()));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de l'ajout des images: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    
     // GET /api/cultures/{cultureId}/images
     //  Récupérer toutes les images supplémentaires d'une culture
     
    @GetMapping("/{cultureId}/images")
    public ResponseEntity<List<String>> getCultureImages(@PathVariable Integer cultureId) {
        try {
            List<Images> images = imagesRepository.findByTypeAndOwnerID("culture", cultureId);
            List<String> imageUrls = images.stream()
                    .map(Images::getImageUrl)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(imageUrls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
     //  DELETE /api/cultures/{cultureId}/images/{imageId}
     // Supprimer une image supplémentaire
     
    @DeleteMapping("/{cultureId}/images/{imageId}")
    public ResponseEntity<Map<String, Object>> deleteCultureImage(
            @PathVariable Integer cultureId,
            @PathVariable Integer imageId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Images> image = imagesRepository.findById(imageId);
            if (!image.isPresent()) {
                response.put("success", false);
                response.put("message", "Image non trouvée");
                return ResponseEntity.notFound().build();
            }

            // Vérifier que l'image appartient bien à cette culture
            if (!image.get().getType().equals("culture") || image.get().getOwnerID() != cultureId) {
                response.put("success", false);
                response.put("message", "Cette image n'appartient pas à cette culture");
                return ResponseEntity.badRequest().body(response);
            }

            imagesRepository.deleteById(imageId);

            response.put("success", true);
            response.put("message", "Image supprimée avec succès");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

 

private Map<String, Object> mapCultureToResponse(Cultures culture) {
        Map<String, Object> result = new HashMap<>();
        
        result.put("id", culture.getId());
        result.put("title", culture.getTitle());
        result.put("author", culture.getAuthor());
        result.put("description", culture.getDescription());
        result.put("detail", culture.getDetail());
        result.put("imageUrl", culture.getImageUrl());
        result.put("dateOfCreation", culture.getDateOfCreation());
        
     
        if (culture.getTeam() != null) {
            Map<String, Object> teamInfo = new HashMap<>();
            teamInfo.put("id", culture.getTeam().getId());
            teamInfo.put("name", culture.getTeam().getName());
            teamInfo.put("country", culture.getTeam().getCountry());
            result.put("team", teamInfo);
        }

        List<String> images = imagesRepository
                .findByTypeAndOwnerID("culture", culture.getId())
                .stream()
                .map(Images::getImageUrl)
                .collect(Collectors.toList());
        result.put("images", images);
        
        return result;
    }
}