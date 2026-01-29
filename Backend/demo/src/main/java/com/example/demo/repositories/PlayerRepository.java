package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.Players;
import java.util.List;

public interface PlayerRepository extends JpaRepository<Players, Integer> {
      Players findById(int id);
}
