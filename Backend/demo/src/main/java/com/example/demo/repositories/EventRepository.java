package com.example.demo.repositories;

import com.example.demo.models.Events;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Events, Integer> {
    
    List<Events> findByName(String name);
    
    List<Events> findByCityId(Integer cityId);
    
    List<Events> findByNameContainingIgnoreCase(String name);
    
    // Recherche avec filtres (ville et/ou nom)
    @Query("SELECT e FROM Events e WHERE " +
           "(:cityId IS NULL OR e.city.id = :cityId) AND " +
           "(:searchTerm IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Events> findByFilters(
            @Param("cityId") Integer cityId,
            @Param("searchTerm") String searchTerm
    );
    
    // Trouver les événements à venir
    List<Events> findByDateOfEventAfterOrderByDateOfEventAsc(LocalDateTime date);
    
    // Trouver les événements par période
    List<Events> findByDateOfEventBetweenOrderByDateOfEventAsc(
            LocalDateTime startDate, 
            LocalDateTime endDate
    );
}