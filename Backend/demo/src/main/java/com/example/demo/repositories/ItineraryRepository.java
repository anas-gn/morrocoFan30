package com.example.demo.repositories;

import com.example.demo.models.Itineraries;
import com.example.demo.models.Attractions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItineraryRepository extends JpaRepository<Itineraries, Integer> {
List<Itineraries> findBySupporterId(int supporterId);
}
