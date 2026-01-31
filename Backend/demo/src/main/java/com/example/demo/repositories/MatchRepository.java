package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.models.Matches;

public interface MatchRepository extends JpaRepository<Matches, Integer> {

    Matches findById(int id);

    @Query("""
                SELECT DISTINCT m FROM Matches m
                WHERE m.id IN (
                    SELECT mt.match.id FROM MatchTeam mt
                    WHERE mt.team.id IN (
                        SELECT gt.team.id FROM GroupTeam gt
                        WHERE gt.group.id = :groupId
                    )
                )
            """)
    List<Matches> findMatchesByGroupeId(@Param("groupId") int groupId);

    @Query("""
                SELECT DISTINCT mt.match
                FROM MatchTeam mt
                WHERE LOWER(mt.team.name) LIKE LOWER(CONCAT('%', :teamName, '%'))
            """)
    List<Matches> findMatchesByTeamName(@Param("teamName") String teamName);

    List<Matches> findByStatus(String status);

}
