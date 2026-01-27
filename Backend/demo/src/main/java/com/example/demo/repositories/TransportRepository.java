package com.example.demo.repositories;

import com.example.demo.models.Transport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransportRepository extends JpaRepository<Transport, Integer> {
    List<Transport> findByName(String name);

    List<Transport> findByCityId(Integer cityId);
}