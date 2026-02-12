package com.example.demo.controllers;

import com.example.demo.hooks.TransportDTO;
import com.example.demo.models.CityHosts;
import com.example.demo.models.Routes;
import com.example.demo.models.Transports;
import com.example.demo.models.Images;
import com.example.demo.repositories.CityHostRepository;
import com.example.demo.repositories.RouteRepository;
import com.example.demo.repositories.TransportsRepository;
import com.example.demo.repositories.ImageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transports")
public class TransportsController {

    @Autowired
    private TransportsRepository transportsRepository;

    @Autowired
    private CityHostRepository cityHostsRepository;

    @Autowired
    private RouteRepository routesRepository;

    @Autowired
    private ImageRepository imagesRepository;


    // GET - Récupérer tous les transports
    @GetMapping
    public ResponseEntity<List<TransportDTO>> getAllTransports() {
        List<Transports> transports = transportsRepository.findAll();
        List<TransportDTO> dtos = transports.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // GET - Récupérer un transport par ID
    @GetMapping("/{id}")
    public ResponseEntity<TransportDTO> getTransportById(@PathVariable Integer id) {
        Transports transport = transportsRepository.findById(id).orElse(null);
        if (transport == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(convertToDTO(transport));
    }

    // POST - Créer un transport
    @PostMapping
    public ResponseEntity<TransportDTO> createTransport(@RequestBody TransportDTO dto) {
        CityHosts city = cityHostsRepository.findById(dto.getCityID()).orElse(null);
        if (city == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        Transports transport = new Transports();
        transport.setName(dto.getName());
        transport.setDescription(dto.getDescription());
        transport.setCapacity(dto.getCapacity());
        transport.setPriceProxim(dto.getPriceProxim());
        transport.setImageUrl(dto.getImageUrl());
        transport.setCity(city);

        if (dto.getTrajetID() != null) {
            Routes route = routesRepository.findById(dto.getTrajetID()).orElse(null);
            if (route != null) transport.setTrajet(route);
        }

        Transports saved = transportsRepository.save(transport);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(saved));
    }

    // PUT - Mettre à jour un transport
    @PutMapping("/{id}")
    public ResponseEntity<TransportDTO> updateTransport(@PathVariable Integer id, @RequestBody TransportDTO dto) {
        Transports transport = transportsRepository.findById(id).orElse(null);
        if (transport == null) return ResponseEntity.notFound().build();

        if (dto.getName() != null) transport.setName(dto.getName());
        if (dto.getDescription() != null) transport.setDescription(dto.getDescription());
        if (dto.getCapacity() != null) transport.setCapacity(dto.getCapacity());
        if (dto.getPriceProxim() != null) transport.setPriceProxim(dto.getPriceProxim());
        if (dto.getImageUrl() != null) transport.setImageUrl(dto.getImageUrl());

        if (dto.getCityID() != null) {
            CityHosts city = cityHostsRepository.findById(dto.getCityID()).orElse(null);
            if (city != null) transport.setCity(city);
        }

        if (dto.getTrajetID() != null) {
            Routes route = routesRepository.findById(dto.getTrajetID()).orElse(null);
            if (route != null) transport.setTrajet(route);
        }

        Transports updated = transportsRepository.save(transport);
        return ResponseEntity.ok(convertToDTO(updated));
    }

    // DELETE - Supprimer un transport
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransport(@PathVariable Integer id) {
        Transports transport = transportsRepository.findById(id).orElse(null);
        if (transport == null) return ResponseEntity.notFound().build();
        transportsRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<TransportDTO>> searchByName(@RequestParam(required = false) String name) {
        List<Transports> transports =
                (name != null && !name.isEmpty())
                        ? transportsRepository.findByNameContainingIgnoreCase(name)
                        : transportsRepository.findAll();

        return ResponseEntity.ok(transports.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<TransportDTO>> getByCity(@PathVariable Integer cityId) {
        List<Transports> transports = transportsRepository.findByCityId(cityId);
        return ResponseEntity.ok(transports.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/route/{routeId}")
    public ResponseEntity<List<TransportDTO>> getByRoute(@PathVariable Integer routeId) {
        List<Transports> transports = transportsRepository.findByRouteId(routeId);
        return ResponseEntity.ok(transports.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/without-route")
    public ResponseEntity<List<TransportDTO>> getWithoutRoute() {
        List<Transports> transports = transportsRepository.findByRouteIsNull();
        return ResponseEntity.ok(transports.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/with-route")
    public ResponseEntity<List<TransportDTO>> getWithRoute() {
        List<Transports> transports = transportsRepository.findByRouteIsNotNull();
        return ResponseEntity.ok(transports.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

// Ajouter des images à un transport existant
@PostMapping("/{transportId}/images")
public ResponseEntity<?> addImagesToTransport(
        @PathVariable Integer transportId,
        @RequestBody Map<String, Object> request) {

    if (!transportsRepository.existsById(transportId)) {
        return ResponseEntity.notFound().build();
    }

    @SuppressWarnings("unchecked")
    List<String> imageUrls = (List<String>) request.get("imageUrls");

    if (imageUrls == null || imageUrls.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("message", "Aucune image fournie"));
    }

    for (String url : imageUrls) {
        Images image = new Images();
        image.setImageUrl(url);
        image.setType("transport");
        image.setOwnerID(transportId);
        imagesRepository.save(image);
    }

    return ResponseEntity.ok(Map.of("message", imageUrls.size() + " image(s) ajoutée(s)"));
}

// Récupérer toutes les images d'un transport
@GetMapping("/{transportId}/images")
public ResponseEntity<List<String>> getTransportImages(@PathVariable Integer transportId) {
    List<String> images = imagesRepository.findByTypeAndOwnerID("transport", transportId)
            .stream()
            .map(Images::getImageUrl)
            .collect(Collectors.toList());
    return ResponseEntity.ok(images);
}

//  Supprimer une image spécifique par ID
@DeleteMapping("/images/{imageId}")
public ResponseEntity<?> deleteTransportImage(@PathVariable Integer imageId) {
    if (!imagesRepository.existsById(imageId)) {
        return ResponseEntity.notFound().build();
    }
    imagesRepository.deleteById(imageId);
    return ResponseEntity.ok(Map.of("message", "Image supprimée avec succès"));
}

// Supprimer plusieurs images à la fois 
@DeleteMapping("/{transportId}/images")
public ResponseEntity<?> deleteMultipleTransportImages(
        @PathVariable Integer transportId,
        @RequestBody Map<String, Object> request) {

    if (!transportsRepository.existsById(transportId)) {
        return ResponseEntity.notFound().build();
    }

    @SuppressWarnings("unchecked")
    List<Integer> imageIds = (List<Integer>) request.get("imageIds");

    if (imageIds == null || imageIds.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("message", "Aucune image fournie pour suppression"));
    }

    int deletedCount = 0;
    for (Integer id : imageIds) {
        if (imagesRepository.existsById(id)) {
            imagesRepository.deleteById(id);
            deletedCount++;
        }
    }

    return ResponseEntity.ok(Map.of("message", deletedCount + " image(s) supprimée(s)"));
}



    private TransportDTO convertToDTO(Transports transport) {

        List<String> images = imagesRepository
                .findByTypeAndOwnerID("transport", transport.getId())
                .stream()
                .map(Images::getImageUrl)
                .collect(Collectors.toList());

        TransportDTO dto = new TransportDTO();
        dto.setId(transport.getId());
        dto.setName(transport.getName());
        dto.setDescription(transport.getDescription());
        dto.setCapacity(transport.getCapacity());
        dto.setPriceProxim(transport.getPriceProxim());
        dto.setImageUrl(transport.getImageUrl()); // image principale
        dto.setImages(images); //  images multiples

        if (transport.getCity() != null) {
            dto.setCityID(transport.getCity().getId());
            dto.setCityName(transport.getCity().getName());
        }

        if (transport.getTrajet() != null) {
            dto.setTrajetID(transport.getTrajet().getId());
            dto.setTrajetName(transport.getTrajet().getName());
        }

        return dto;
    }
}
