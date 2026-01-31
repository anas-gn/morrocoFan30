package com.example.demo.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.Stades;

public interface StadeRepository extends JpaRepository<Stades, Integer> {

    Stades findById(int id);

    Stades findByName(String name);

    List<Stades> findByCityHostId(int cityHostId);

    @Query(value = "SELECT * FROM Stades ORDER BY Capacity DESC LIMIT nombre", nativeQuery = true)
    List<Stades> findTopByOrderByCapacityDesc(@Param("nombre") int nombre);
}