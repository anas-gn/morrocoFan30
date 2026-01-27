package com.example.demo.repositories;

import com.example.demo.models.Itinerary;
import com.example.demo.models.Attraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Integer> {

    List<Itinerary> findByAttraction(Attraction attraction);
}
