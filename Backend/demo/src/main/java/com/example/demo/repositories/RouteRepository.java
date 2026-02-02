package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.models.Routes;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Routes, Integer> {

    List<Routes> findByNameContainingIgnoreCase(String name);

    List<Routes> findByDescriptionContainingIgnoreCase(String keyword);

    List<Routes> findByCityHostFromId(Long cityId);

    List<Routes> findByCityHostToId(Long cityId);

    List<Routes> findByCityHostFromIdAndCityHostToId(Long fromCityId, Long toCityId);

    List<Routes> findByCityHostFromIdAndCityHostToIdOrderByPriceProximAsc(Long fromCityId, Long toCityId);

    List<Routes> findByPriceProximBetween(Float minPrice, Float maxPrice);

    List<Routes> findByPriceProximGreaterThan(Float price);

    List<Routes> findByPriceProximLessThan(Float price);
}