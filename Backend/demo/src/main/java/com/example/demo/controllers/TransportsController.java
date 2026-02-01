package com.example.demo.controllers;

import com.example.demo.hooks.TransportDTO;
import com.example.demo.models.CityHosts;
import com.example.demo.models.Routes;
import com.example.demo.models.Transports;
import com.example.demo.repositories.CityHostRepository;
import com.example.demo.repositories.RouteRepository;
import com.example.demo.repositories.TransportsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transports")
@CrossOrigin(origins = "*")
public class TransportsController {

    @Autowired
    private TransportsRepository transportsRepository;

    @Autowired
    private CityHostRepository cityHostsRepository;

    @Autowired
    private RouteRepository routesRepository;


    // GET - Récupérer tous les transports
    @GetMapping
    public ResponseEntity<List<TransportDTO>> getAllTransports() {
        List<Transports> transports = transportsRepository.findAll();
        List<TransportDTO> dtos = transports.stream().map(this::convertToDTO).collect(Collectors.toList());
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
        // Vérifier la ville
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
        List<Transports> transports;
        if (name != null && !name.isEmpty()) {
            transports = transportsRepository.findByNameContainingIgnoreCase(name);
        } else {
            transports = transportsRepository.findAll();
        }
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


    private TransportDTO convertToDTO(Transports transport) {
        TransportDTO dto = new TransportDTO();
        dto.setId(transport.getId());
        dto.setName(transport.getName());
        dto.setDescription(transport.getDescription());
        dto.setCapacity(transport.getCapacity());
        dto.setPriceProxim(transport.getPriceProxim());
        dto.setImageUrl(transport.getImageUrl());

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
