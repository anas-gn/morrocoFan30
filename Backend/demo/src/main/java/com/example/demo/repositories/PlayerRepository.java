package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.Player;
import java.util.List;

public interface PlayerRepository extends JpaRepository<Player, Integer> {
    List<Player> findByTId(int teamId);
    List<Player> findByNameContainingIgnoreCase(String name);
}
