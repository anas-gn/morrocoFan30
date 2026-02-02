package com.example.demo.controllers;

import com.example.demo.hooks.FoodDTO;
import com.example.demo.models.Foods;
import com.example.demo.models.CityHosts;
import com.example.demo.repositories.FoodRepository;
import com.example.demo.repositories.CityHostRepository;
import com.example.demo.models.Images;
import com.example.demo.repositories.ImageRepository;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private CityHostRepository cityHostRepository;

    @Autowired
    private ImageRepository imagesRepository;


    // GET - Tous les plats
    @GetMapping
    public ResponseEntity<List<FoodDTO>> getAllFoods(
            @RequestParam(required = false) Integer cityId,
            @RequestParam(required = false) String search) {

        List<Foods> foods;

        if (cityId != null || search != null) {
            foods = FoodRepository.findByFilters(cityId, search);
        } else {
            foods = foodRepository.findAll();
        }

        List<FoodDTO> dtos = foods.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    
    // GET - Plat par ID
    
    @GetMapping("/{id}")
    public ResponseEntity<FoodDTO> getFoodById(@PathVariable Integer id) {
        Optional<Foods> food = foodRepository.findById(id);
        return food
                .map(value -> ResponseEntity.ok(convertToDTO(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

  
    // GET - Recherche par nom
   
    @GetMapping("/search")
    public ResponseEntity<List<FoodDTO>> searchFoods(@RequestParam String name) {
        List<Foods> foods = foodRepository.findByNameContainingIgnoreCase(name);
        return ResponseEntity.ok(
                foods.stream().map(this::convertToDTO).collect(Collectors.toList())
        );
    }


    // GET - Plats par ville

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<FoodDTO>> getFoodsByCity(@PathVariable Integer cityId) {
        List<Foods> foods = foodRepository.findByCityId(cityId);
        return ResponseEntity.ok(
                foods.stream().map(this::convertToDTO).collect(Collectors.toList())
        );
    }

    // POST - Créer un plat
    
    @PostMapping
    public ResponseEntity<FoodDTO> createFood(@RequestBody FoodDTO dto) {
        try {
            Foods food = convertToEntity(dto);
            Foods saved = foodRepository.save(food);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT - Mettre à jour un plat

    @PutMapping("/{id}")
    public ResponseEntity<FoodDTO> updateFood(
            @PathVariable Integer id,
            @RequestBody FoodDTO dto) {

        if (!foodRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        try {
            Foods food = convertToEntity(dto);
            food.setId(id);
            Foods updated = foodRepository.save(food);
            return ResponseEntity.ok(convertToDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    // DELETE - Supprimer un plat

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFood(@PathVariable Integer id) {
        if (!foodRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        foodRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // POST - Ajouter des images à un plat existant
@PostMapping("/{foodId}/images")
public ResponseEntity<?> addImagesToFood(
        @PathVariable Integer foodId,
        @RequestBody List<String> imageUrls) {

    if (!foodRepository.existsById(foodId)) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Plat introuvable"));
    }

    for (String url : imageUrls) {
        Images image = new Images();
        image.setImageUrl(url);
        image.setType("food");
        image.setOwnerID(foodId);
        imagesRepository.save(image);
    }

    return ResponseEntity.ok(
            Map.of("message", imageUrls.size() + " image(s) ajoutée(s)")
    );
}

// GET - Récupérer toutes les images d'un plat
@GetMapping("/{foodId}/images")
public ResponseEntity<List<String>> getFoodImages(@PathVariable Integer foodId) {
    List<String> images = imagesRepository
            .findByTypeAndOwnerID("food", foodId)
            .stream()
            .map(Images::getImageUrl)
            .collect(Collectors.toList());

    return ResponseEntity.ok(images);
}


// DELETE - Supprimer une ou plusieurs images d'un plat
@DeleteMapping("/{foodId}/images")
public ResponseEntity<?> deleteFoodImages(
        @PathVariable Integer foodId,
        @RequestBody List<String> imageUrls) {

    if (!foodRepository.existsById(foodId)) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Plat introuvable"));
    }

    List<Images> foodImages = imagesRepository.findByTypeAndOwnerID("food", foodId);

    List<Images> imagesToDelete = foodImages.stream()
            .filter(img -> imageUrls.contains(img.getImageUrl()))
            .toList();

    if (imagesToDelete.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Aucune des images fournies n'a été trouvée"));
    }

    imagesToDelete.forEach(imagesRepository::delete);

    return ResponseEntity.ok(
            Map.of("message", imagesToDelete.size() + " image(s) supprimée(s)",
                   "deletedImages", imagesToDelete.stream().map(Images::getImageUrl).toList())
    );
}
 
    // Entity -> DTO
  
private FoodDTO convertToDTO(Foods food) {

    // Récupérer toutes les images supplémentaires du plat
    List<String> images = imagesRepository
            .findByTypeAndOwnerID("food", food.getId())
            .stream()
            .map(Images::getImageUrl)
            .collect(Collectors.toList());

    return new FoodDTO(
            food.getId(),
            food.getName(),
            food.getCategory(),
            food.getDescription(),
            food.getPriceProxim(),
            food.getImageUrl(), // image principale
            food.getCity() != null ? food.getCity().getId() : null,
            food.getCity() != null ? food.getCity().getName() : null,
            images //  images supplémentaires
    );
}

   
    // DTO -> Entity
   
    private Foods convertToEntity(FoodDTO dto) {
        Foods food = new Foods();
        food.setId(dto.getId());
        food.setName(dto.getName());
        food.setCategory(dto.getCategory());
        food.setDescription(dto.getDescription());
        food.setPriceProxim(dto.getPriceProxim());
        food.setImageUrl(dto.getImageUrl());

        if (dto.getCityId() != null) {
            Optional<CityHosts> city = cityHostRepository.findById(dto.getCityId());
            city.ifPresent(food::setCity);
        }

        return food;
    }
}
