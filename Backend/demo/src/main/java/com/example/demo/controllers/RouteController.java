package com.example.demo.controllers;

import com.example.demo.hooks.RouteDTO;
import com.example.demo.hooks.TransportDTO;
import com.example.demo.models.Routes;
import com.example.demo.models.CityHosts;
import com.example.demo.models.Images;
import com.example.demo.models.Transports;
import com.example.demo.repositories.RouteRepository;
import com.example.demo.repositories.CityHostRepository;
import com.example.demo.repositories.ImageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.HashMap;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "*")
public class RouteController {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private CityHostRepository cityHostRepository;

    @Autowired
    private ImageRepository imageRepository;

    @GetMapping("/all")
    public ResponseEntity<List<RouteDTO>> getAllRoutes() {
        List<Routes> routes = routeRepository.findAll();
        List<RouteDTO> routeDTOs = routes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(routeDTOs, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteDTO> getRouteById(@PathVariable int id) {
        Optional<Routes> route = routeRepository.findById(id);
        if (route.isPresent()) {
            return new ResponseEntity<>(convertToDTOWithTransports(route.get()), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/add")
    public ResponseEntity<RouteDTO> createRoute(@RequestBody RouteDTO routeDTO) {
        try {
            Routes route = convertToEntity(routeDTO);
            Routes savedRoute = routeRepository.save(route);
            return new ResponseEntity<>(convertToDTO(savedRoute), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RouteDTO> updateRoute(@PathVariable int id, @RequestBody RouteDTO routeDTO) {
        Optional<Routes> existingRoute = routeRepository.findById(id);
        if (existingRoute.isPresent()) {
            Routes route = convertToEntity(routeDTO);
            route.setId(id);
            route.setTransports(existingRoute.get().getTransports());
            Routes updatedRoute = routeRepository.save(route);
            return new ResponseEntity<>(convertToDTO(updatedRoute), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PatchMapping("/updatee/{id}")
    public ResponseEntity<RouteDTO> partialUpdateRoute(
            @PathVariable int id,
            @RequestBody Map<String, Object> updates) {
        Optional<Routes> existingRoute = routeRepository.findById(id);

        if (!existingRoute.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Routes route = existingRoute.get();

        if (updates.containsKey("name")) {
            route.setName((String) updates.get("name"));
        }
        if (updates.containsKey("description")) {
            route.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("priceProxim")) {
            route.setPriceProxim(Float.parseFloat(updates.get("priceProxim").toString()));
        }

        Routes updatedRoute = routeRepository.save(route);
        return new ResponseEntity<>(convertToDTO(updatedRoute), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable int id) {
        Optional<Routes> route = routeRepository.findById(id);
        if (route.isPresent()) {
            routeRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/delete/city/{cityId}")
    public ResponseEntity<Map<String, Object>> deleteRoutesByCity(@PathVariable Long cityId) {
        List<Routes> routesFrom = routeRepository.findByCityHostFromId(cityId);
        List<Routes> routesTo = routeRepository.findByCityHostToId(cityId);

        routesFrom.forEach(r -> routeRepository.deleteById(r.getId()));
        routesTo.forEach(r -> routeRepository.deleteById(r.getId()));

        Map<String, Object> result = new HashMap<>();
        result.put("deletedFromRoutes", routesFrom.size());
        result.put("deletedToRoutes", routesTo.size());
        result.put("totalDeleted", routesFrom.size() + routesTo.size());

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/searchByname/{name}")
    public ResponseEntity<List<RouteDTO>> searchRoutesByName(@RequestParam String name) {
        List<Routes> routes = routeRepository.findByNameContainingIgnoreCase(name);
        List<RouteDTO> routeDTOs = routes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(routeDTOs, HttpStatus.OK);
    }

    @GetMapping("/searchByDescription/{keyword}")
    public ResponseEntity<List<RouteDTO>> searchRoutesByDescription(@RequestParam String keyword) {
        List<Routes> routes = routeRepository.findByDescriptionContainingIgnoreCase(keyword);
        List<RouteDTO> routeDTOs = routes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(routeDTOs, HttpStatus.OK);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<RouteDTO>> filterRoutes(
            @RequestParam(required = false) Long fromCityId,
            @RequestParam(required = false) Long toCityId,
            @RequestParam(required = false) Float minPrice,
            @RequestParam(required = false) Float maxPrice) {

        List<Routes> routes = routeRepository.findAll();

        List<RouteDTO> filteredRoutes = routes.stream()
                .filter(r -> fromCityId == null ||
                        (r.getCityHostFrom() != null && r.getCityHostFrom().getId() == fromCityId))
                .filter(r -> toCityId == null ||
                        (r.getCityHostTo() != null && r.getCityHostTo().getId() == toCityId))
                .filter(r -> minPrice == null || r.getPriceProxim() >= minPrice)
                .filter(r -> maxPrice == null || r.getPriceProxim() <= maxPrice)
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(RouteDTO::getPriceProxim))
                .collect(Collectors.toList());

        return new ResponseEntity<>(filteredRoutes, HttpStatus.OK);
    }

    @GetMapping("/from/{cityId}")
    public ResponseEntity<List<RouteDTO>> getRoutesFromCity(@PathVariable Long cityId) {
        List<Routes> routes = routeRepository.findByCityHostFromId(cityId);
        List<RouteDTO> routeDTOs = routes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(routeDTOs, HttpStatus.OK);
    }

    @GetMapping("/to/{cityId}")
    public ResponseEntity<List<RouteDTO>> getRoutesToCity(@PathVariable Long cityId) {
        List<Routes> routes = routeRepository.findByCityHostToId(cityId);
        List<RouteDTO> routeDTOs = routes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(routeDTOs, HttpStatus.OK);
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<Map<String, List<RouteDTO>>> getRoutesByCity(@PathVariable Long cityId) {
        List<Routes> routesFrom = routeRepository.findByCityHostFromId(cityId);
        List<Routes> routesTo = routeRepository.findByCityHostToId(cityId);

        Map<String, List<RouteDTO>> result = new HashMap<>();
        result.put("routesFrom", routesFrom.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
        result.put("routesTo", routesTo.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/between/{fromCityId}/to/{toCityId}")
    public ResponseEntity<List<RouteDTO>> getRoutesBetweenCities(
            @RequestParam("fromCityId") Long fromCityId,
            @RequestParam("toCityId") Long toCityId) {
        List<Routes> routes = routeRepository.findByCityHostFromIdAndCityHostToId(
                fromCityId, toCityId);
        List<RouteDTO> routeDTOs = routes.stream()
                .map(this::convertToDTOWithTransports)
                .sorted(Comparator.comparing(RouteDTO::getPriceProxim))
                .collect(Collectors.toList());
        return new ResponseEntity<>(routeDTOs, HttpStatus.OK);
    }

    @GetMapping("/exists")
    public ResponseEntity<Map<String, Object>> routeExists(
            @RequestParam Long fromCityId,
            @RequestParam Long toCityId) {
        List<Routes> routes = routeRepository.findByCityHostFromIdAndCityHostToId(
                fromCityId, toCityId);
        Map<String, Object> result = new HashMap<>();
        result.put("exists", !routes.isEmpty());
        result.put("count", routes.size());
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/priceRange/{minPrice}/to/{maxPrice}")
    public ResponseEntity<List<RouteDTO>> getRoutesByPriceRange(
            @RequestParam("minPrice") Float minPrice,
            @RequestParam("maxPrice") Float maxPrice) {
        List<Routes> routes = routeRepository.findByPriceProximBetween(minPrice, maxPrice);
        List<RouteDTO> routeDTOs = routes.stream()
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(RouteDTO::getPriceProxim))
                .collect(Collectors.toList());
        return new ResponseEntity<>(routeDTOs, HttpStatus.OK);
    }

    @GetMapping("/above-price")
    public ResponseEntity<List<RouteDTO>> getRoutesAbovePrice(@RequestParam Float price) {
        List<Routes> routes = routeRepository.findByPriceProximGreaterThan(price);
        List<RouteDTO> routeDTOs = routes.stream()
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(RouteDTO::getPriceProxim))
                .collect(Collectors.toList());
        return new ResponseEntity<>(routeDTOs, HttpStatus.OK);
    }

    @GetMapping("/belowPrice/{price}")
    public ResponseEntity<List<RouteDTO>> getRoutesBelowPrice(@RequestParam Float price) {
        List<Routes> routes = routeRepository.findByPriceProximLessThan(price);
        List<RouteDTO> routeDTOs = routes.stream()
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(RouteDTO::getPriceProxim))
                .collect(Collectors.toList());
        return new ResponseEntity<>(routeDTOs, HttpStatus.OK);
    }

    /**
     * Route la moins chère entre deux villes
     */
    @GetMapping("/cheapest")
    public ResponseEntity<RouteDTO> getCheapestRoute(
            @RequestParam Long fromCityId,
            @RequestParam Long toCityId) {

        List<Routes> routes = routeRepository.findByCityHostFromIdAndCityHostToIdOrderByPriceProximAsc(
                fromCityId, toCityId);

        if (routes.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        RouteDTO cheapestRoute = convertToDTOWithTransports(routes.get(0));
        return new ResponseEntity<>(cheapestRoute, HttpStatus.OK);
    }

    @GetMapping("/cheapestAll")
    public ResponseEntity<List<RouteDTO>> getCheapestRoutes(
            @RequestParam(defaultValue = "5") int limit) {
        List<Routes> routes = routeRepository.findAll();
        List<RouteDTO> cheapRoutes = routes.stream()
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(RouteDTO::getPriceProxim))
                .limit(limit)
                .collect(Collectors.toList());
        return new ResponseEntity<>(cheapRoutes, HttpStatus.OK);
    }

    @GetMapping("/mostExpensive")
    public ResponseEntity<List<RouteDTO>> getMostExpensiveRoutes(
            @RequestParam(defaultValue = "5") int limit) {
        List<Routes> routes = routeRepository.findAll();
        List<RouteDTO> expensiveRoutes = routes.stream()
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(RouteDTO::getPriceProxim).reversed())
                .limit(limit)
                .collect(Collectors.toList());
        return new ResponseEntity<>(expensiveRoutes, HttpStatus.OK);
    }

    @GetMapping("/{routeId}/transports")
    public ResponseEntity<List<TransportDTO>> getTransportsByRoute(@PathVariable int routeId) {
        Optional<Routes> route = routeRepository.findById(routeId);

        if (!route.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        List<TransportDTO> transports = route.get().getTransports().stream()
                .map(this::convertTransportToDTO)
                .sorted(Comparator.comparing(TransportDTO::getPriceProxim))
                .collect(Collectors.toList());

        return new ResponseEntity<>(transports, HttpStatus.OK);
    }

    @GetMapping("/{routeId}/transports/cheapest")
    public ResponseEntity<TransportDTO> getCheapestTransport(@PathVariable int routeId) {
        Optional<Routes> route = routeRepository.findById(routeId);

        if (!route.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Optional<Transports> cheapestTransport = route.get().getTransports().stream()
                .min(Comparator.comparing(Transports::getPriceProxim));

        if (!cheapestTransport.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(convertTransportToDTO(cheapestTransport.get()), HttpStatus.OK);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getRoutesCount() {
        long count = routeRepository.count();
        return new ResponseEntity<>(count, HttpStatus.OK);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getRoutesStatistics() {
        List<Routes> routes = routeRepository.findAll();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRoutes", routes.size());

        if (!routes.isEmpty()) {
            Double avgPrice = routes.stream()
                    .mapToDouble(Routes::getPriceProxim)
                    .average()
                    .orElse(0.0);

            Float minPrice = routes.stream()
                    .map(Routes::getPriceProxim)
                    .min(Float::compareTo)
                    .orElse(0.0f);

            Float maxPrice = routes.stream()
                    .map(Routes::getPriceProxim)
                    .max(Float::compareTo)
                    .orElse(0.0f);

            stats.put("averagePrice", avgPrice);
            stats.put("minPrice", minPrice);
            stats.put("maxPrice", maxPrice);
            stats.put("priceRange", maxPrice - minPrice);
        }

        return new ResponseEntity<>(stats, HttpStatus.OK);
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<Map<String, Object>> getRouteSummary(@PathVariable int id) {
        Optional<Routes> route = routeRepository.findById(id);

        if (!route.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Routes r = route.get();
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", r.getId());
        summary.put("name", r.getName());
        summary.put("description", r.getDescription());
        summary.put("price", r.getPriceProxim());
        summary.put("from", r.getCityHostFrom() != null ? r.getCityHostFrom().getName() : null);
        summary.put("to", r.getCityHostTo() != null ? r.getCityHostTo().getName() : null);
        summary.put("transportsCount", r.getTransports() != null ? r.getTransports().size() : 0);

        if (r.getTransports() != null && !r.getTransports().isEmpty()) {
            Float cheapestTransportPrice = r.getTransports().stream()
                    .map(Transports::getPriceProxim)
                    .min(Float::compareTo)
                    .orElse(0.0f);
            summary.put("cheapestTransportPrice", cheapestTransportPrice);
        }

        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<RouteDTO>> getPopularRoutes(
            @RequestParam(defaultValue = "5") int limit) {
        List<Routes> routes = routeRepository.findAll();
        List<RouteDTO> popularRoutes = routes.stream()
                .map(this::convertToDTOWithTransports)
                .sorted(Comparator
                        .comparing((RouteDTO dto) -> dto.getTransports() != null ? dto.getTransports().size() : 0)
                        .reversed())
                .limit(limit)
                .collect(Collectors.toList());
        return new ResponseEntity<>(popularRoutes, HttpStatus.OK);
    }

    @GetMapping("/sortedByName")
    public ResponseEntity<List<RouteDTO>> getRoutesSortedByName(
            @RequestParam(defaultValue = "asc") String order) {
        List<Routes> routes = routeRepository.findAll();
        List<RouteDTO> sortedRoutes = routes.stream()
                .map(this::convertToDTO)
                .sorted(order.equalsIgnoreCase("desc")
                        ? Comparator.comparing(RouteDTO::getName).reversed()
                        : Comparator.comparing(RouteDTO::getName))
                .collect(Collectors.toList());
        return new ResponseEntity<>(sortedRoutes, HttpStatus.OK);
    }

    // ==================== HELPER METHODS ====================

    private RouteDTO convertToDTO(Routes route) {
        RouteDTO dto = new RouteDTO();
        dto.setId(route.getId());
        dto.setName(route.getName());
        dto.setDescription(route.getDescription());
        dto.setPriceProxim(route.getPriceProxim());

        if (route.getCityHostFrom() != null) {
            dto.setCityHostFromID((long) route.getCityHostFrom().getId());
            dto.setCityHostFromName(route.getCityHostFrom().getName());
        }

        if (route.getCityHostTo() != null) {
            dto.setCityHostToID((long) route.getCityHostTo().getId());
            dto.setCityHostToName(route.getCityHostTo().getName());
        }

        return dto;
    }

    private RouteDTO convertToDTOWithTransports(Routes route) {
        RouteDTO dto = convertToDTO(route);

        List<TransportDTO> transports = route.getTransports().stream()
                .map(this::convertTransportToDTO)
                .sorted(Comparator.comparing(TransportDTO::getPriceProxim))
                .collect(Collectors.toList());
        dto.setTransports(transports);

        if (!transports.isEmpty()) {
            dto.setCheapestTransport(transports.get(0));
        }

        return dto;
    }

    private TransportDTO convertTransportToDTO(Transports transport) {
        TransportDTO dto = new TransportDTO();
        dto.setId(transport.getId());
        dto.setName(transport.getName());
        dto.setPriceProxim(transport.getPriceProxim());
        dto.setDescription(transport.getDescription());
        dto.setCapacity(transport.getCapacity());
        dto.setImageUrl(transport.getImageUrl());

        if (transport.getCity() != null) {
            dto.setCityID(transport.getCity().getId());
            dto.setCityName(transport.getCity().getName());
        }

        if (transport.getTrajet() != null) {
            dto.setTrajetID(transport.getTrajet().getId());
            dto.setTrajetName(transport.getTrajet().getName());
        }

        List<String> imageUrls = imageRepository
                .findByTypeAndOwnerID("transport", transport.getId())
                .stream()
                .map(Images::getImageUrl)
                .collect(Collectors.toList());

        dto.setImages(imageUrls);

        return dto;
    }

    private Routes convertToEntity(RouteDTO dto) {
        Routes route = new Routes();
        route.setName(dto.getName());
        route.setDescription(dto.getDescription());
        route.setPriceProxim(dto.getPriceProxim());

        if (dto.getCityHostFromID() != null && dto.getCityHostFromID() > 0) {
            Optional<CityHosts> cityFrom = cityHostRepository.findById(dto.getCityHostFromID().intValue());
            cityFrom.ifPresent(route::setCityHostFrom);
        }

        if (dto.getCityHostToID() != null && dto.getCityHostToID() > 0) {
            Optional<CityHosts> cityTo = cityHostRepository.findById(dto.getCityHostToID().intValue());
            cityTo.ifPresent(route::setCityHostTo);
        }

        return route;
    }
}