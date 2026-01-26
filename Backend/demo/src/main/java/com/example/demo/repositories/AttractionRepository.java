package com.example.demo.repositories;

import com.example.demo.models.Attraction;
import com.example.demo.models.CityHost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttractionRepository extends JpaRepository<Attraction, Integer> {

    List<Attraction> findByCityHost(CityHost cityHost);
}
