package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import com.example.demo.models.Match;

public interface MatchRepository extends JpaRepository<Match, Integer> {

    Match findById(int id);

    @Query("""
                SELECT DISTINCT m FROM Matches m
                WHERE m.id IN (
                    SELECT mt.matchID FROM MatchTeam mt
                    WHERE mt.teamID IN (
                        SELECT gt.teamID FROM GroupTeam gt
                        WHERE gt.groupID = :groupeId
                    )
                )
            """)
    List<Match> findMatchesByGroupeId(int id);

}
