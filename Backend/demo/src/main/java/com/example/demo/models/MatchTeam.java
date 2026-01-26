package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "matchTeam")
public class MatchTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int goals;

    @ManyToOne
    @JoinColumn(name = "matchID", nullable = false)
    private Match match;

    @ManyToOne
    @JoinColumn(name = "teamID", nullable = false)
    private Team team;

    public MatchTeam(int goals, Match m, Team t) {
        this.goals = goals;
        this.match = m;
        this.team = t;
    }

    public int getGoals() {
        return goals;
    }

    public void setGoals(int goals) {
        this.goals = goals;
    }

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match m) {
        this.match = m;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team t) {
        this.team = t;
    }

}