package com.example.demo.controllers;

import com.example.demo.hooks.HotelDTO;
import com.example.demo.models.Hotels;
import com.example.demo.models.CityHosts;
import com.example.demo.repositories.HotelRepository;
import com.example.demo.repositories.CityHostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelController {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private CityHostRepository cityHostsRepository;

    // GET all hotels
    @GetMapping("/all")
    public ResponseEntity<List<HotelDTO>> getAllHotels() {
        List<Hotels> hotels = hotelRepository.findAll();
        List<HotelDTO> hotelDTOs = hotels.stream().map(this::convertToDTO).collect(Collectors.toList());
        return new ResponseEntity<>(hotelDTOs, HttpStatus.OK);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getHotelsCount() {
        long count = hotelRepository.count();
        return new ResponseEntity<>(count, HttpStatus.OK);
    }

    // GET - Rechercher des hôtels par nom
    @GetMapping("/search/{name}")
    public ResponseEntity<List<HotelDTO>> searchHotelsByName(@RequestParam String name) {
        List<Hotels> hotels = hotelRepository.findByNameContainingIgnoreCase(name);
        List<HotelDTO> hotelDTOs = hotels.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(hotelDTOs, HttpStatus.OK);
    }

    // GET hotel by ID
    @GetMapping("/{id}")
    public ResponseEntity<HotelDTO> getHotelById(@PathVariable int id) {
        Optional<Hotels> hotel = hotelRepository.findById(id);
        if (hotel.isPresent()) {
            return new ResponseEntity<>(convertToDTO(hotel.get()), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // POST - Create new hotel
    @PostMapping("/creat")
    public ResponseEntity<HotelDTO> createHotel(@RequestBody HotelDTO hotelDTO) {
        try {
            Hotels hotel = convertToEntity(hotelDTO);
            Hotels savedHotel = hotelRepository.save(hotel);
            return new ResponseEntity<>(convertToDTO(savedHotel), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // PUT - Update hotel
    @PutMapping("/update/{id}")
    public ResponseEntity<HotelDTO> updateHotel(@PathVariable int id, @RequestBody HotelDTO hotelDTO) {
        Optional<Hotels> existingHotel = hotelRepository.findById(id);
        if (existingHotel.isPresent()) {
            Hotels hotel = convertToEntity(hotelDTO);
            hotel.setId(id);
            Hotels updatedHotel = hotelRepository.save(hotel);
            return new ResponseEntity<>(convertToDTO(updatedHotel), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // DELETE hotel
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable int id) {
        Optional<Hotels> hotel = hotelRepository.findById(id);
        if (hotel.isPresent()) {
            hotelRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Helper methods to convert between Entity and DTO
    private HotelDTO convertToDTO(Hotels hotel) {
        HotelDTO dto = new HotelDTO();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setAddress(hotel.getAddress());
        dto.setDescription(hotel.getDescription());
        dto.setEmail(hotel.getEmail());
        dto.setPhone(hotel.getPhone());
        dto.setImageUrl(hotel.getImageUrl());
        dto.setUrlReservation(hotel.getUrlReservation());

        if (hotel.getCityHost() != null) {
            dto.setCityHostId(hotel.getCityHost().getId());
            dto.setCityName(hotel.getCityHost().getName());
        }

        return dto;
    }

    private Hotels convertToEntity(HotelDTO dto) {
        Hotels hotel = new Hotels();
        hotel.setName(dto.getName());
        hotel.setAddress(dto.getAddress());
        hotel.setDescription(dto.getDescription());
        hotel.setEmail(dto.getEmail());
        hotel.setPhone(dto.getPhone());
        hotel.setImageUrl(dto.getImageUrl());
        hotel.setUrlReservation(dto.getUrlReservation());

        if (dto.getCityHostId() > 0) {
            Optional<CityHosts> cityHost = cityHostsRepository.findById(dto.getCityHostId());
            cityHost.ifPresent(hotel::setCityHost);
        }

        return hotel;
    }
}