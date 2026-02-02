package com.example.demo.repositories;

import com.example.demo.models.*;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ResponsableRepository extends JpaRepository<Responsables, Integer> {

    Responsables findByEmail(String email);

    Responsables findByName(String name);

    Responsables findByNameIgnoreCase(String name);

    List<Responsables> findByNameContaining(String name);

    List<Responsables> findByNameContainingIgnoreCase(String name);
}