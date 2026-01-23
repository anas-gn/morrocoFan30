package com.example.demo.repositories;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.MatchTeam;


public interface MatchTeamRepository extends JpaRepository<MatchTeam, Integer> {
    
}
