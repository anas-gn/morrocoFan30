package com.example.demo.repositories;

import com.example.demo.models.MatchEvents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchEventsRepository extends JpaRepository<MatchEvents, Integer> {
    List<MatchEvents> findByMatchID(int matchID);
    List<MatchEvents> findByPlayerID(int playerID);
    List<MatchEvents> findByTeamID(int teamID);
}