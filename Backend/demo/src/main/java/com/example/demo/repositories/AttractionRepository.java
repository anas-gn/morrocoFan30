package com.example.demo.repositories;

import com.example.demo.models.Attractions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttractionRepository extends JpaRepository<Attractions, Integer> {


}
