package com.example.demo.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.Stades;
import org.springframework.data.domain.Pageable;

public interface StadeRepository extends JpaRepository<Stades, Integer> {

    Stades findById(int id);

    Stades findByName(String name);

    List<Stades> findByCityHostId(int cityHostId);

   List<Stades> findAllByOrderByCapacityDesc(Pageable pageable);
}