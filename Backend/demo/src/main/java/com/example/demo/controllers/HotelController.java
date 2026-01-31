package com.example.demo.controllers;

import com.example.demo.models.CityHosts;
import com.example.demo.models.Hotels;
import com.example.demo.repositories.CityHostRepository;
import com.example.demo.repositories.HotelRepository;
import com.example.demo.hooks.HotelDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private CityHostRepository cityHostRepository;

   
    // CREATE HOTEL 
   
    @PostMapping("/add/{cityId}")
    public boolean addHotel(@PathVariable int cityId,
                            @RequestBody Hotels hotel) {

        CityHosts city = cityHostRepository.findById(cityId).orElse(null);
        if (city == null || hotel == null) return false;

        hotel.setCityHost(city);
        hotelRepository.save(hotel);
        return true;
    }

   
    // UPDATE HOTEL
   
    @PutMapping("/update/{id}")
    public boolean updateHotel(@PathVariable int id,
                               @RequestBody Hotels hotel) {

        Hotels existing = hotelRepository.findById(id).orElse(null);
        if (existing == null) return false;

        existing.setName(hotel.getName());
        existing.setAddress(hotel.getAddress());
        existing.setDescription(hotel.getDescription());
        existing.setEmail(hotel.getEmail());
        existing.setPhone(hotel.getPhone());
        existing.setImageUrl(hotel.getImageUrl());
        existing.setUrlReservation(hotel.getUrlReservation());

        hotelRepository.save(existing);
        return true;
    }

   
    // DELETE HOTEL
   
    @DeleteMapping("/delete/{id}")
    public boolean deleteHotel(@PathVariable int id) {

        if (!hotelRepository.existsById(id)) return false;
        hotelRepository.deleteById(id);
        return true;
    }

 
    // GET HOTELS BY CITY 
  
    @GetMapping("/city/{cityId}")
    public List<HotelDTO> getHotelsByCity(@PathVariable int cityId) {

        return hotelRepository.findByCityHostId(cityId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

   
    // GET HOTEL DETAILS
   
    @GetMapping("/{id}")
    public HotelDTO getHotelById(@PathVariable int id) {

        Hotels hotel = hotelRepository.findById(id).orElse(null);
        if (hotel == null) return null;

        return convertToDTO(hotel);
    }

   
    // DTO CONVERTER
   
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

        return dto;
    }
}
