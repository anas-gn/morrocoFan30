package com.example.demo.repositories;

import com.example.demo.models.Foods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Foods, Integer> {

    // Search by name only
    List<Foods> findByNameContainingIgnoreCase(String name);

    // Search with optional cityId + search filters (used by GET /api/foods?cityId=&search=)
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
    List<Foods> findByFilters(
            @Param("cityId") Integer cityId,
            @Param("search") String search
    );

    // Get dishes by city
    @Query("SELECT f FROM Foods f WHERE f.cityHost.id = :cityId")
    List<Foods> findByCityId(@Param("cityId") Integer cityId);

    // Get dishes by city + name search (replaces the broken derived method)
    List<Foods> findByCityHost_IdAndNameContainingIgnoreCase(Integer cityId, String name);

    // Get distinct city names (for filters)
    @Query("SELECT DISTINCT c.name FROM Foods f JOIN f.cityHost c ORDER BY c.name")
    List<String> findDistinctCityNames();
}