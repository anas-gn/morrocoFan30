package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.models.MatchTeam;

public interface MatchTeamRepository extends JpaRepository<MatchTeam, Integer> {
     @Query("""
                   SELECT mt FROM MatchTeam mt where mt.matchID = :id

               """)
     List<MatchTeam> findByMatchId(int id);

     @Query("""
                   SELECT mt FROM MatchTeam mt where mt.matchID = :id and mt.teamID = :idT

               """)
     MatchTeam findByMatchIdAndTeamId(int id, int idT);
}
