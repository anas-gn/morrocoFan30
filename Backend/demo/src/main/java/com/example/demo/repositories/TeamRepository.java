package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.Teams;

public interface TeamRepository extends JpaRepository<Teams, Integer> {
    Teams findById(int id);
}
