package com.example.demo.repositories;

import com.example.demo.models.Supporters;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupporterRepository extends JpaRepository<Supporters, Integer> {

    Supporters findById(int id);

    List<Supporters> findAllByOrderByTotalPointsDesc();

    Supporters findByEmail(String email);

    boolean existsById(int id);

    List<Supporters> findByNameContainingIgnoreCase(String name);

    List<Supporters> findByCountry(String country);

    List<Supporters> findByAgeBetween(int minAge, int maxAge);

    boolean existsByEmail(String email);

    List<Supporters> findByTotalPointsGreaterThan(int points);

    List<Supporters> findByTotalPointsBetween(int minPoints, int maxPoints);

    List<Supporters> findByCountryOrderByTotalPointsDesc(String country);

    void deleteByEmail(String email);

    long countByCountry(String country);

    @Query("SELECT s.country AS country, COUNT(s) AS count FROM Supporters s GROUP BY s.country")
    List<Object[]> countSupportersByCountry();
}