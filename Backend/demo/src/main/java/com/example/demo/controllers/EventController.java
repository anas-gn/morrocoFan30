package com.example.demo.controllers;

import com.example.demo.hooks.EventDTO;
import com.example.demo.models.Events;
import com.example.demo.models.CityHosts;
import com.example.demo.repositories.EventRepository;
import com.example.demo.repositories.CityHostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CityHostRepository cityHostRepository;

    // GET - Récupérer tous les événements avec filtres optionnels (ville et recherche)
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
        
        List<EventDTO> eventDTOs = events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(eventDTOs);
    }

    // GET - Récupérer un événement par ID
    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Integer id) {
        Optional<Events> event = eventRepository.findById(id);
        if (event.isPresent()) {
            return ResponseEntity.ok(convertToDTO(event.get()));
        }
        return ResponseEntity.notFound().build();
    }

    // GET - Rechercher des événements par nom
    @GetMapping("/search")
    public ResponseEntity<List<EventDTO>> searchEventsByName(@RequestParam String name) {
        List<Events> events = eventRepository.findByNameContainingIgnoreCase(name);
        List<EventDTO> eventDTOs = events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(eventDTOs);
    }

    // GET - Récupérer les événements d'une ville
    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<EventDTO>> getEventsByCity(@PathVariable Integer cityId) {
        List<Events> events = eventRepository.findByCityId(cityId);
        List<EventDTO> eventDTOs = events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(eventDTOs);
    }

    // GET - Exporter un événement au format iCalendar
    @GetMapping(value = "/{id}/export/ical", produces = "text/calendar")
    public ResponseEntity<String> exportEventToICalendar(@PathVariable Integer id) {
        Optional<Events> eventOpt = eventRepository.findById(id);
        
        if (eventOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Events event = eventOpt.get();
        String icalContent = generateICalendar(List.of(event));
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=event_" + id + ".ics")
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(icalContent);
    }

    // GET - Exporter plusieurs événements au format iCalendar
    @GetMapping(value = "/export/ical", produces = "text/calendar")
    public ResponseEntity<String> exportEventsToICalendar(
            @RequestParam(required = false) List<Integer> eventIds) {
        
        List<Events> events;
        
        if (eventIds != null && !eventIds.isEmpty()) {
            events = eventRepository.findAllById(eventIds);
        } else {
            events = eventRepository.findByDateOfEventAfterOrderByDateOfEventAsc(
                    LocalDateTime.now()
            );
        }
        
        String icalContent = generateICalendar(events);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=events.ics")
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(icalContent);
    }

    // POST - Créer un nouvel événement
    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@RequestBody EventDTO eventDTO) {
        try {
            Events event = convertToEntity(eventDTO);
            Events savedEvent = eventRepository.save(event);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedEvent));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // PUT - Mettre à jour un événement
    @PutMapping("/{id}")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Integer id, 
                                                 @RequestBody EventDTO eventDTO) {
        Optional<Events> existingEvent = eventRepository.findById(id);
        if (existingEvent.isPresent()) {
            try {
                Events event = convertToEntity(eventDTO);
                event.setId(id);
                Events updatedEvent = eventRepository.save(event);
                return ResponseEntity.ok(convertToDTO(updatedEvent));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE - Supprimer un événement
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Integer id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Convertir Entity -> DTO
    private EventDTO convertToDTO(Events event) {
        return new EventDTO(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getDateOfEvent(),
                event.getPriceProxim(),
                event.getImageUrl(),
                event.getCity() != null ? event.getCity().getId() : null,
                event.getCity() != null ? event.getCity().getName() : null
        );
    }

    // Convertir DTO -> Entity
    private Events convertToEntity(EventDTO eventDTO) {
        Events event = new Events();
        event.setId(eventDTO.getId());
        event.setName(eventDTO.getName());
        event.setDescription(eventDTO.getDescription());
        event.setDateOfEvent(eventDTO.getDateOfEvent());
        event.setPriceProxim(eventDTO.getPriceProxim());
        event.setImageUrl(eventDTO.getImageUrl());

        if (eventDTO.getCityId() != null) {
            Optional<CityHosts> city = cityHostRepository.findById(eventDTO.getCityId());
            city.ifPresent(event::setCity);
        }

        return event;
    }

    // Générer le fichier iCalendar
    private String generateICalendar(List<Events> events) {
        StringBuilder ical = new StringBuilder();
        
        ical.append("BEGIN:VCALENDAR\r\n");
        ical.append("VERSION:2.0\r\n");
        ical.append("PRODID:-//Events System//Events Calendar//EN\r\n");
        ical.append("CALSCALE:GREGORIAN\r\n");
        ical.append("METHOD:PUBLISH\r\n");
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
        
        for (Events event : events) {
            ical.append("BEGIN:VEVENT\r\n");
            ical.append("UID:").append(event.getId()).append("@events-system.com\r\n");
            ical.append("DTSTAMP:").append(LocalDateTime.now().format(formatter)).append("\r\n");
            ical.append("DTSTART:").append(event.getDateOfEvent().format(formatter)).append("\r\n");
            
            // Durée par défaut de 2 heures
            ical.append("DTEND:").append(
                    event.getDateOfEvent().plusHours(2).format(formatter)
            ).append("\r\n");
            
            ical.append("SUMMARY:").append(escapeICalText(event.getName())).append("\r\n");
            
            if (event.getDescription() != null) {
                ical.append("DESCRIPTION:").append(
                        escapeICalText(event.getDescription())
                ).append("\r\n");
            }
            
            if (event.getCity() != null) {
                ical.append("LOCATION:").append(escapeICalText(event.getCity().getName())).append("\r\n");
            }
            
            ical.append("STATUS:CONFIRMED\r\n");
            ical.append("END:VEVENT\r\n");
        }
        
        ical.append("END:VCALENDAR\r\n");
        
        return ical.toString();
    }

    // Échapper les caractères spéciaux pour iCalendar
    private String escapeICalText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace(";", "\\;")
                   .replace(",", "\\,")
                   .replace("\n", "\\n");
    }
}