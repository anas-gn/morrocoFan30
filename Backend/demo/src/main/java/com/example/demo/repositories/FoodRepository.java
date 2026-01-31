package com.example.demo.repositories;

import com.example.demo.models.Foods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Foods, Integer> {

    
    // Recherche par nom 

    List<Foods> findByNameContainingIgnoreCase(String name);

    
    // Recherche par ville
   
    @Query("""
        SELECT f FROM Foods f
        WHERE (:cityId IS NULL OR f.cityHost.id = :cityId)
        AND (
            :search IS NULL
            OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(f.category) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        ORDER BY f.name
    """)
    static
    List<Foods> findByFilters(
            @Param("cityId") Integer cityId,
            @Param("search") String search
    ) {
        return null;
    }       

    
    // Récupérer les plats d'une ville

    @Query("SELECT f FROM Foods f WHERE f.cityHost.id = :cityId")
    List<Foods> findByCityId(@Param("cityId") Integer cityId);

    
    // Récupérer les villes distinctes (pour filtres)

    @Query("SELECT DISTINCT c.name FROM Foods f JOIN f.cityHost c ORDER BY c.name")
    List<String> findDistinctCityNames();
}
