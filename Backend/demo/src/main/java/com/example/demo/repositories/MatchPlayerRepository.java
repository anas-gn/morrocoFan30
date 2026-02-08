package com.example.demo.repositories;

import com.example.demo.models.MatchPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchPlayerRepository extends JpaRepository<MatchPlayer, Integer> {
    List<MatchPlayer> findByMatchID(int matchID);
    List<MatchPlayer> findByPlayerID(int playerID);
    List<MatchPlayer> findByTeamID(int teamID);
    List<MatchPlayer> findByMatchIDAndTeamID(int matchID, int teamID);
    List<MatchPlayer> findByMatchIDAndIsStarter(int matchID, boolean isStarter);
}