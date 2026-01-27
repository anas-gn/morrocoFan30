package com.example.demo.repositories;

import com.example.demo.models.CityHost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CityHostRepository extends JpaRepository<CityHost, Integer> {
}
