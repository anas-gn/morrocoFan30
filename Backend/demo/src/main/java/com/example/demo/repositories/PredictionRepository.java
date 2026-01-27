package com.example.demo.repositories;

import com.example.demo.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PredictionRepository extends JpaRepository<Prediction, Integer> {

    List<Prediction> findBySupporterId(int supporterId);

    List<Prediction> findByMatchId(int matchId);
}