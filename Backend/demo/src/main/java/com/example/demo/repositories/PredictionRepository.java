package com.example.demo.repositories;
import com.example.demo.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    List<Prediction> findBySupporterId(Long supporterId);

    List<Prediction> findByMatchId(Long matchId);
}