package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.models.Routes;

@Repository
public interface RouteRepository extends JpaRepository<Routes, Integer> {

}