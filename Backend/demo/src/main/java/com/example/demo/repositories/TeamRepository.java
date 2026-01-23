package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.Team;

public interface TeamRepository extends JpaRepository<Team, Integer> {
   
}
