package com.example.demo.repositories;
import java.util.List;

import com.example.demo.models.CityHost;
import com.example.demo.models.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
List<Hotel> findByCityHost(CityHost cityHost);

}
