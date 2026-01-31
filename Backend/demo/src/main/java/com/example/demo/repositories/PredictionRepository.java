package com.example.demo.repositories;

import com.example.demo.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PredictionRepository extends JpaRepository<Predictions, Integer> {
 Predictions findById(int id);
    List<Predictions> findBySupporterId(int supporterId);
    List<Predictions> findByMatchId(int matchId);
    Predictions findByMatchIdAndSupporterId(int matchId, int supporterId);
    List<Predictions> findByStatus(String status);
}