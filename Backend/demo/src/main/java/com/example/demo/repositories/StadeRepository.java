package com.example.demo.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.Stades;



public interface StadeRepository extends JpaRepository<Stades, Integer> {

    Stades findById(int id);
}
