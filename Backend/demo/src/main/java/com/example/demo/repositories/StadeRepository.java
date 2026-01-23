package com.example.demo.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.Stade;

public interface StadeRepository extends JpaRepository<Stade, Integer> {
}
