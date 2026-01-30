package com.example.demo.repositories;

import com.example.demo.models.Reviews;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Reviews, Integer> {
    
    List<Reviews> findBySupporterId(int supporterId);
    List<Reviews> findByMatchId(int matchId);
    List<Reviews> findByRating(int rating);
}
