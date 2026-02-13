package com.example.demo.controllers;

import com.example.demo.repositories.CityHostRepository;
import com.example.demo.models.CityHosts;
import com.example.demo.models.Hotels;
import com.example.demo.models.Attractions;
import com.example.demo.models.Stades;
import com.example.demo.hooks.CityHostDTO;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cities")
public class CityHostController {

    @Autowired
    private CityHostRepository cityHostRepository;
    

    // ADD CITY
 
    @PostMapping("/add")
    public boolean addCity(@RequestBody CityHosts city) {
        if (city == null) return false;
        cityHostRepository.save(city);
        return true;
    }
    // UPDATE CITY
    @PutMapping("/update/{id}")
    public boolean updateCity(@PathVariable int id, @RequestBody CityHosts city) {
        CityHosts existingCity = cityHostRepository.findById(id).orElse(null);
        if (existingCity == null) return false;

        existingCity.setName(city.getName());
        existingCity.setCountry(city.getCountry());
        existingCity.setDescription(city.getDescription());
        existingCity.setRegion(city.getRegion());

        cityHostRepository.save(existingCity);
        return true;
    }
    // DELETE CITY
    @DeleteMapping("/delete/{id}")
    public boolean deleteCity(@PathVariable int id) {
        CityHosts city = cityHostRepository.findById(id).orElse(null);
        if (city == null) return false;

        cityHostRepository.deleteById(id);
        return true;
    }

    //  GET ALL HOST CITIES
    // Page Cities
    @GetMapping("/all")
    public List<CityHostDTO> getAllCities() {
        return cityHostRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // GET CITY BY ID
    // Page : City detail
    @GetMapping("/{id}")
    public CityHostDTO getCityById(@PathVariable int id) {
        CityHosts city = cityHostRepository.findById(id).orElse(null);
        if (city == null) return null;
        return convertToDTO(city);
    } 
    //  GET HOTELS OF CITY
    @GetMapping("/{id}/hotels")
    public List<Hotels> getCityHotels(@PathVariable int id) {
        CityHosts city = cityHostRepository.findById(id).orElse(null);
        if (city == null) return null;
        return city.getHotels();
    }
    //  GET ATTRACTIONS OF CITY
    @GetMapping("/{id}/attractions")
    public List<Attractions> getCityAttractions(@PathVariable int id) {
        CityHosts city = cityHostRepository.findById(id).orElse(null);
        if (city == null) return null;
        return city.getAttractions();
    }
    @GetMapping("/{id}/stades")
    public List<Stades> getCityStades(@PathVariable int id) {
        CityHosts city = cityHostRepository.findById(id).orElse(null);
        if (city == null) return null;
        return city.getStades();
    }

    private CityHostDTO convertToDTO(CityHosts city) {
        CityHostDTO dto = new CityHostDTO();
        dto.setId(city.getId());
        dto.setName(city.getName());
        dto.setCountry(city.getCountry());
        dto.setDescription(city.getDescription());
        dto.setRegion(city.getRegion());
        dto.setImageUrl(city.getImageUrl());
        return dto;
    }
}
