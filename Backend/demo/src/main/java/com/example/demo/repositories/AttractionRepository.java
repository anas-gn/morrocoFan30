package com.example.demo.repositories;
import java.util.List;

import com.example.demo.models.Attraction;
import com.example.demo.models.CityHost;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttractionRepository extends JpaRepository<Attraction, Long> {
List<Attraction> findByCityHost(CityHost cityHost);

}
