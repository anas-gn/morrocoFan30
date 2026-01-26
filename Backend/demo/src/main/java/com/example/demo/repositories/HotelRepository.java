package com.example.demo.repositories;

import com.example.demo.models.Hotel;
import com.example.demo.models.CityHost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Integer> {

    List<Hotel> findByCityHost(CityHost cityHost);
}
