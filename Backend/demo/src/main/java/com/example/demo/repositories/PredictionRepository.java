package com.example.demo.repositories;

import com.example.demo.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PredictionRepository extends JpaRepository<Predictions, Integer> {

    @Query("""
            SELECT p FROM Predictions p
            JOIN FETCH p.supporter
            JOIN FETCH p.match
            WHERE p.supporter.id = :supporterId
            """)
    List<Predictions> findBySupporterId(@Param("supporterId") int supporterId);

    @Query("""
            SELECT p FROM Predictions p
            JOIN FETCH p.match
            WHERE p.match.id = :matchId
            """)
    List<Predictions> findByMatchId(@Param("matchId") int matchId);

    @Query("SELECT p FROM Predictions p WHERE p.match.id = :matchId and p.supporter.id = :supporterId")
    Predictions findByMatchIdAndSupporterId(@Param("matchId") int matchId, @Param("supporterId") int supporterId);

    @Query("SELECT p FROM Predictions  p WHERE p.status = :status")
    List<Predictions> findByStatus(@Param("status") String status);
}