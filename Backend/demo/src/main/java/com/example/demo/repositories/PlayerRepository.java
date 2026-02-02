package com.example.demo.repositories;

import com.example.demo.models.Players;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlayerRepository extends JpaRepository<Players, Integer> {

      Players findById(int id);

      List<Players> findByTeamId(int teamId);

      List<Players> findByNameContainingIgnoreCase(String name);

      List<Players> findByOrderByGoalsDesc(Pageable pageable);

      List<Players> findByGoals(int goals);
}