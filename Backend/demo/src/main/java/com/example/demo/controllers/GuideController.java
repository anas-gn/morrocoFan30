package com.example.demo.controllers;

import com.example.demo.hooks.GuideDTO;
import com.example.demo.models.Guides;
import com.example.demo.models.CityHosts;
import com.example.demo.repositories.GuideRepository;
import com.example.demo.repositories.CityHostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/guides")
@CrossOrigin(origins = "*")
public class GuideController {

    @Autowired
    private GuideRepository guideRepository;

    @Autowired
    private CityHostRepository cityHostRepository;

    // GET all guides
    @GetMapping("/all")
    public ResponseEntity<List<GuideDTO>> getAllGuides() {
        List<Guides> guides = guideRepository.findAll();
        List<GuideDTO> guideDTOs = guides.stream().map(this::convertToDTO).collect(Collectors.toList());
        return new ResponseEntity<>(guideDTOs, HttpStatus.OK);
    }

    // GET guide by ID
    @GetMapping("/{id}")
    public ResponseEntity<GuideDTO> getGuideById(@PathVariable int id) {
        Optional<Guides> guide = guideRepository.findById(id);
        if (guide.isPresent()) {
            return new ResponseEntity<>(convertToDTO(guide.get()), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // GET - Compter le nombre total de guides
    @GetMapping("/count")
    public ResponseEntity<Long> getGuidesCount() {
        long count = guideRepository.count();
        return new ResponseEntity<>(count, HttpStatus.OK);
    }

    // GET - Rechercher des guides par nom
    @GetMapping("/search/{name}")
    public ResponseEntity<List<GuideDTO>> searchGuidesByName(@RequestParam String name) {
        List<Guides> guides = guideRepository.findByNameContainingIgnoreCase(name);
        List<GuideDTO> guideDTOs = guides.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(guideDTOs, HttpStatus.OK);
    }

    // POST - Create new guide
    @PostMapping("/create")
    public ResponseEntity<GuideDTO> createGuide(@RequestBody GuideDTO guideDTO) {
        try {
            Guides guide = convertToEntity(guideDTO);
            Guides savedGuide = guideRepository.save(guide);
            return new ResponseEntity<>(convertToDTO(savedGuide), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // PUT - Update guide
    @PutMapping("/update/{id}")
    public ResponseEntity<GuideDTO> updateGuide(@PathVariable int id, @RequestBody GuideDTO guideDTO) {
        Optional<Guides> existingGuide = guideRepository.findById(id);
        if (existingGuide.isPresent()) {
            Guides guide = convertToEntity(guideDTO);
            guide.setId(id);
            Guides updatedGuide = guideRepository.save(guide);
            return new ResponseEntity<>(convertToDTO(updatedGuide), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // DELETE guide
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteGuide(@PathVariable int id) {
        Optional<Guides> guide = guideRepository.findById(id);
        if (guide.isPresent()) {
            guideRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Helper methods to convert between Entity and DTO
    private GuideDTO convertToDTO(Guides guide) {
        GuideDTO dto = new GuideDTO();
        dto.setId(guide.getId());
        dto.setName(guide.getName());
        dto.setAddress(guide.getAddress());
        dto.setDescription(guide.getDescription());
        dto.setEmail(guide.getEmail());
        dto.setPhone(guide.getPhone());
        dto.setImageUrl(guide.getImageUrl());
        dto.setLanguages(guide.getLanguages());

        if (guide.getCity() != null) {
            dto.setCityId(guide.getCity().getId());
            dto.setCityName(guide.getCity().getName());
        }

        return dto;
    }

    private Guides convertToEntity(GuideDTO dto) {
        Guides guide = new Guides();
        guide.setName(dto.getName());
        guide.setAddress(dto.getAddress());
        guide.setDescription(dto.getDescription());
        guide.setEmail(dto.getEmail());
        guide.setPhone(dto.getPhone());
        guide.setImageUrl(dto.getImageUrl());
        guide.setLanguages(dto.getLanguages());

        if (dto.getCityId() > 0) {
            Optional<CityHosts> city = cityHostRepository.findById(dto.getCityId());
            city.ifPresent(guide::setCity);
        }

        return guide;
    }
}