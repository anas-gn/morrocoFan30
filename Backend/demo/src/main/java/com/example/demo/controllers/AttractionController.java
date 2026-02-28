package com.example.demo.controllers;

import com.example.demo.repositories.AttractionRepository;
import com.example.demo.repositories.CityHostRepository;
import com.example.demo.repositories.ImageRepository;
import com.example.demo.models.Attractions;
import com.example.demo.models.CityHosts;
import com.example.demo.models.Images;
import com.example.demo.hooks.AttractionDTO;
import com.example.demo.hooks.ImageDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attractions")
public class AttractionController {

    @Autowired
    private AttractionRepository attractionRepository;

    @Autowired
    private CityHostRepository cityHostRepository;

    @Autowired
    private ImageRepository imageRepository; // ← instance, pas classe statique

    // CREATE
    @PostMapping("/add/{cityId}")
    public boolean addAttraction(@PathVariable int cityId,
                                 @RequestBody Attractions attraction) {
        CityHosts city = cityHostRepository.findById(cityId).orElse(null);
        if (city == null || attraction == null) return false;
        attraction.setCityHost(city);
        attractionRepository.save(attraction);
        return true;
    }

    // UPDATE
    @PutMapping("/update/{id}")
    public boolean updateAttraction(@PathVariable int id,
                                    @RequestBody Attractions attraction) {
        Attractions existing = attractionRepository.findById(id).orElse(null);
        if (existing == null) return false;

        existing.setName(attraction.getName());
        existing.setCountry(attraction.getCountry());
        existing.setType(attraction.getType());
        existing.setPriceProxim(attraction.getPriceProxim());
        existing.setDescription(attraction.getDescription());
        existing.setAddress(attraction.getAddress());
        existing.setHoureOfOpening(attraction.getHoureOfOpening());
        existing.setHoureOfClosing(attraction.getHoureOfClosing());
        existing.setImageUrl(attraction.getImageUrl());

        attractionRepository.save(existing);
        return true;
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public boolean deleteAttraction(@PathVariable int id) {
        Attractions attraction = attractionRepository.findById(id).orElse(null);
        if (attraction == null) return false;
        attractionRepository.deleteById(id);
        return true;
    }

    // GET ATTRACTIONS OF A CITY
    @GetMapping("/city/{cityId}")
    public List<AttractionDTO> getAttractionsByCity(@PathVariable int cityId) {
        CityHosts city = cityHostRepository.findById(cityId).orElse(null);
        if (city == null) return null;
        return city.getAttractions()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // GET ATTRACTION DETAILS
    @GetMapping("/{id}")
    public AttractionDTO getAttractionById(@PathVariable int id) {
        Attractions attraction = attractionRepository.findById(id).orElse(null);
        if (attraction == null) return null;
        return convertToDTO(attraction);
    }

    

    
    
    @GetMapping("/images/attraction/{attractionId}")
    public List<ImageDTO> getAttractionImages(@PathVariable int attractionId) {
        List<Images> images = imageRepository.findByTypeAndOwnerID("attraction", attractionId); // ← minuscule
        return images.stream()
                .map(this::convertImageToDTO)
                .collect(Collectors.toList());
    }

    
    private AttractionDTO convertToDTO(Attractions attraction) {
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
        dto.setImageUrl(attraction.getImageUrl());
        return dto;
    }

    private ImageDTO convertImageToDTO(Images image) {
        ImageDTO dto = new ImageDTO();
        dto.setId(image.getId());
        dto.setImageUrl(image.getImageUrl()); 
        dto.setType(image.getType());
        dto.setOwnerID(image.getOwnerID());
        return dto;
    }
}
