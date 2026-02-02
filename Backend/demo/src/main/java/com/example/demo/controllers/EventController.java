package com.example.demo.controllers;

import com.example.demo.hooks.EventDTO;
import com.example.demo.models.*;
import com.example.demo.repositories.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CityHostRepository cityHostRepository;

    @Autowired
    private ImageRepository imagesRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SupporterRepository supportersRepository;


    // Envoyer une notification à tous les supporters
    private void sendNotificationToAllSupporters(Events event, String prefix) {
        try {
            List<Supporters> allSupporters = supportersRepository.findAll();

            String content = prefix + " : " + event.getName()
                    + " (Ville : " + event.getCity().getName() + ")";

            for (Supporters supporter : allSupporters) {
                Notifications notification = new Notifications();
                notification.setDateOfSend(LocalDateTime.now());
                notification.setContent(content);
                notification.setIsRead(false);
                notification.setSupporter(supporter);
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Erreur notification : " + e.getMessage());
        }
    }


    // GET - Récupérer tous les événements avec filtres optionnels
    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents(
            @RequestParam(required = false) Integer cityId,
            @RequestParam(required = false) String search) {

        List<Events> events;

        if (cityId != null || search != null) {
            events = eventRepository.findByFilters(cityId, search);
        } else {
            events = eventRepository.findAll();
        }

        // Entity -> DTO 
        List<EventDTO> eventDTOs = events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(eventDTOs);
    }

    // GET - Récupérer un événement par ID
    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Integer id) {
        return eventRepository.findById(id)
                .map(event -> ResponseEntity.ok(convertToDTO(event)))
                .orElse(ResponseEntity.notFound().build());
    }

    // GET - Récupérer les événements d'une ville
    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<EventDTO>> getEventsByCity(@PathVariable Integer cityId) {
        List<EventDTO> events = eventRepository.findByCityId(cityId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(events);
    }



    // POST - Créer un événement avec images + notifications
    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Map<String, Object> request) {
        try {
            // Construction du DTO
            EventDTO dto = new EventDTO();
            dto.setName((String) request.get("name"));
            dto.setDescription((String) request.get("description"));
            dto.setImageUrl((String) request.get("imageUrl"));
            dto.setCityId((Integer) request.get("cityId"));

            // Date de l'événement
            if (request.get("dateOfEvent") != null) {
                dto.setDateOfEvent(LocalDateTime.parse((String) request.get("dateOfEvent")));
            }

            // Prix
            if (request.get("priceProxim") instanceof Number) {
                dto.setPriceProxim(((Number) request.get("priceProxim")).floatValue());
            }

            // Sauvegarde de l'événement
            Events savedEvent = eventRepository.save(convertToEntity(dto));

            // Images supplémentaires
            @SuppressWarnings("unchecked")
            List<String> additionalImages = (List<String>) request.get("additionalImages");

            if (additionalImages != null && !additionalImages.isEmpty()) {
                for (String url : additionalImages) {
                    Images img = new Images();
                    img.setImageUrl(url);
                    img.setType("event");
                    img.setOwnerID(savedEvent.getId());
                    imagesRepository.save(img);
                }
            }

            // Notification création
            sendNotificationToAllSupporters(savedEvent, "Nouvel événement");

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertToDTO(savedEvent));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }


    // PUT - Mettre à jour un événement + notification
@PutMapping("/{id}")
public ResponseEntity<?> updateEvent(
        @PathVariable Integer id,
        @RequestBody EventDTO dto) {

    Events event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));

    // Mise à jour champ par champ
    event.setName(dto.getName());
    event.setDescription(dto.getDescription());
    event.setDateOfEvent(dto.getDateOfEvent());
    event.setPriceProxim(dto.getPriceProxim());
    event.setImageUrl(dto.getImageUrl());

    if (dto.getCityId() != null) {
        cityHostRepository.findById(dto.getCityId())
                .ifPresent(event::setCity);
    }

    Events updatedEvent = eventRepository.save(event);

    sendNotificationToAllSupporters(updatedEvent, "Événement modifié");

    return ResponseEntity.ok(convertToDTO(updatedEvent));
}



    // DELETE - Supprimer un événement
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Integer id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        eventRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Événement supprimé avec succès"));
    }


    // POST - Ajouter des images à un événement existant
    @PostMapping("/{eventId}/images")
    public ResponseEntity<?> addImagesToEvent(
            @PathVariable Integer eventId,
            @RequestBody List<String> imageUrls) {

        if (!eventRepository.existsById(eventId)) {
            return ResponseEntity.notFound().build();
        }

        for (String url : imageUrls) {
            Images image = new Images();
            image.setImageUrl(url);
            image.setType("event");
            image.setOwnerID(eventId);
            imagesRepository.save(image);
        }

        return ResponseEntity.ok(
                Map.of("message", imageUrls.size() + " image(s) ajoutée(s)")
        );
    }

    // GET - Récupérer toutes les images d'un événement
    @GetMapping("/{eventId}/images")
    public ResponseEntity<List<String>> getEventImages(@PathVariable Integer eventId) {
        List<String> images = imagesRepository
                .findByTypeAndOwnerID("event", eventId)
                .stream()
                .map(Images::getImageUrl)
                .collect(Collectors.toList());

        return ResponseEntity.ok(images);
    }

    // DELETE - Supprimer plusieurs images d'un événement existant
@DeleteMapping("/{eventId}/images")
public ResponseEntity<?> deleteEventImages(
        @PathVariable Integer eventId,
        @RequestBody List<String> imageUrls) {

    // Vérifier que l'événement existe
    if (!eventRepository.existsById(eventId)) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Événement introuvable"));
    }

    // Récupérer toutes les images de l'événement
    List<Images> eventImages = imagesRepository.findByTypeAndOwnerID("event", eventId);

    // Filtrer les images à supprimer
    List<Images> imagesToDelete = eventImages.stream()
            .filter(img -> imageUrls.contains(img.getImageUrl()))
            .toList();

    if (imagesToDelete.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Aucune des images fournies n'a été trouvée"));
    }

    // Supprimer les images filtrées
    imagesToDelete.forEach(imagesRepository::delete);

    return ResponseEntity.ok(
            Map.of("message", imagesToDelete.size() + " image(s) supprimée(s)", "deletedImages", 
                   imagesToDelete.stream().map(Images::getImageUrl).toList())
    );
}




    //  Entity -> DTO 
 private EventDTO convertToDTO(Events event) {

    // Récupérer toutes les images supplémentaires de l'événement
    List<String> images = imagesRepository
            .findByTypeAndOwnerID("event", event.getId())
            .stream()
            .map(Images::getImageUrl)
            .collect(Collectors.toList());

    return new EventDTO(
            event.getId(),
            event.getName(),
            event.getDescription(),
            event.getDateOfEvent(),
            event.getPriceProxim(),
            event.getImageUrl(), // image principale
            event.getCity() != null ? event.getCity().getId() : null,
            event.getCity() != null ? event.getCity().getName() : null,
            images // images supplémentaires
    );
}

    // Convertir DTO -> Entity
    private Events convertToEntity(EventDTO dto) {
        Events event = new Events();
        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setDateOfEvent(dto.getDateOfEvent());
        event.setPriceProxim(dto.getPriceProxim());
        event.setImageUrl(dto.getImageUrl());

        if (dto.getCityId() != null) {
            cityHostRepository.findById(dto.getCityId())
                    .ifPresent(event::setCity);
        }

        return event;
    }
}
