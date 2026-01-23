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
    private Match m;

    @ManyToOne
    @JoinColumn(name = "teamID", nullable = false)
    private Team t;

    public MatchTeam(int goals, Match m, Team t) {
        this.goals = goals;
        this.m = m;
        this.t = t;
    }

    public int getGoals() {
        return goals;
    }

    public void setGoals(int goals) {
        this.goals = goals;
    }

    public Match getM() {
        return m;
    }

    public void setM(Match m) {
        this.m = m;
    }

    public Team getT() {
        return t;
    }

    public void setT(Team t) {
        this.t = t;
    }

}