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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private SupporterRepository supporterRepository;

@Autowired
private AttractionRepository attractionRepository;

   
    // CREATE ITINERARY (USER)
    
    @PostMapping("/add/{supporterId}")
    public boolean addItinerary(@PathVariable int supporterId,
                                @RequestBody Itineraries itinerary) {

        Supporters supporter = supporterRepository.findById(supporterId);
        if (supporter == null || itinerary == null) return false;

        itinerary.setSupporter(supporter);
        itineraryRepository.save(itinerary);
        return true;
    }

    
    // GET ITINERARIES OF USER
    @GetMapping("/supporter/{id}")
    public List<ItineraryDTO> getItinerariesBySupporter(@PathVariable int id) {

        return 
        itineraryRepository.findBySupporterId(id)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

@GetMapping("/{id}/attractions")
public List<AttractionDTO> getItineraryAttractions(@PathVariable int id) {

    Itineraries itinerary = itineraryRepository.findById(id).orElse(null);
    if (itinerary == null) return null;

    return itinerary.getAttractions()
            .stream()
            .map(this::convertAttractionToDTO)
            .toList();
}

    // GET ITINERARY DETAILS
    @GetMapping("/{id}")
    public ItineraryDTO getItineraryById(@PathVariable int id) {

        Itineraries itinerary = itineraryRepository.findById(id).orElse(null);
        if (itinerary == null) return null;

        return convertToDTO(itinerary);
    }

    @PostMapping("/{itineraryId}/add-attraction/{attractionId}")
public boolean addAttractionToItinerary(
        @PathVariable int itineraryId,
        @PathVariable int attractionId) {

    Itineraries itinerary = itineraryRepository.findById(itineraryId).orElse(null);
    Attractions attraction = attractionRepository.findById(attractionId).orElse(null);

    if (itinerary == null || attraction == null) return false;
    if (!itinerary.getAttractions().contains(attraction)) {
    itinerary.getAttractions().add(attraction);
    itineraryRepository.save(itinerary);
}


   
    return true;
    
}

@DeleteMapping("/{itineraryId}/remove-attraction/{attractionId}")
public boolean removeAttractionFromItinerary(
        @PathVariable int itineraryId,
        @PathVariable int attractionId) {

    Itineraries itinerary = itineraryRepository.findById(itineraryId).orElse(null);
    Attractions attraction = attractionRepository.findById(attractionId).orElse(null);

    if (itinerary == null || attraction == null) return false;

    itinerary.getAttractions().remove(attraction);
    itineraryRepository.save(itinerary);

    return true;
}


    private ItineraryDTO convertToDTO(Itineraries it) {
        ItineraryDTO dto = new ItineraryDTO();
        dto.setId(it.getId());
        dto.setTitle(it.getTitle());
        dto.setDescription(it.getDescription());
        dto.setDateToGo(it.getDateToGo());
        return dto;
    }
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

    return dto;
}

}
