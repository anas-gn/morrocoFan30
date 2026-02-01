package com.example.demo.repositories;

import com.example.demo.models.Hotels;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotels, Integer> {

    List<Hotels> findByCityHostId(int cityId);
}
