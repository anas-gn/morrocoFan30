package com.example.demo.repositories;

import com.example.demo.models.Transports;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportsRepository extends JpaRepository<Transports, Integer> {

    // Rechercher les transports par ville
    List<Transports> findByCityId(Integer cityId);

    // Rechercher les transports par route
    List<Transports> findByRouteId(Integer routeId);

    // Rechercher les transports par nom (contient)
    List<Transports> findByNameContainingIgnoreCase(String name);

    // Rechercher les transports par capacité minimum
    List<Transports> findByCapacityGreaterThanEqual(Integer capacity);

    // Rechercher les transports par fourchette de prix
    List<Transports> findByPriceProximBetween(Float minPrice, Float maxPrice);

    // Rechercher les transports sans route assignée
    List<Transports> findByRouteIsNull();

    // Rechercher les transports avec route assignée
    List<Transports> findByRouteIsNotNull();

    // Requête personnalisée pour rechercher par ville et capacité
    @Query("SELECT t FROM Transports t WHERE t.city.id = :cityId AND t.capacity >= :minCapacity")
    List<Transports> findByCityAndMinCapacity(@Param("cityId") Integer cityId, 
                                               @Param("minCapacity") Integer minCapacity);

    // Requête personnalisée pour rechercher par prix maximum dans une ville
    @Query("SELECT t FROM Transports t WHERE t.city.id = :cityId AND t.priceProxim <= :maxPrice")
    List<Transports> findByCityAndMaxPrice(@Param("cityId") Integer cityId, 
                                           @Param("maxPrice") Float maxPrice);

    // Compter les transports par ville
    @Query("SELECT COUNT(t) FROM Transports t WHERE t.city.id = :cityId")
    Long countByCity(@Param("cityId") Integer cityId);

    // Rechercher les transports disponibles entre deux villes (via routes)
    @Query("SELECT t FROM Transports t WHERE t.route.cityHostFrom.id = :fromCityId AND t.route.cityHostTo.id = :toCityId")
    List<Transports> findTransportsBetweenCities(@Param("fromCityId") Integer fromCityId, 
                                                  @Param("toCityId") Integer toCityId);

    // Obtenir les transports les moins chers par ville
    @Query("SELECT t FROM Transports t WHERE t.city.id = :cityId ORDER BY t.priceProxim ASC")
    List<Transports> findCheapestByCityOrderByPrice(@Param("cityId") Integer cityId);
}