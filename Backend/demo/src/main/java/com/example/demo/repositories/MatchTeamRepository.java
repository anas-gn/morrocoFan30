package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.MatchTeam;

public interface MatchTeamRepository extends JpaRepository<MatchTeam, Integer> {
    // @Query("SELECT mt FROM MatchTeam mt where mt.match.id = :id")
    // List<MatchTeam> findByMatchId(@Param("id") int id);

    // ash ktkhwr a anas mok nikha lk

    @Query("""
                SELECT mt FROM MatchTeam mt where mt.match.id= :id and mt.team.id = :idT

            """)
    MatchTeam findByMatchIdAndTeamId(int id, int idT);
    
    List<MatchTeam> findByTeamId(int teamId);
    List<MatchTeam> findByMatchId(int matchId);
}