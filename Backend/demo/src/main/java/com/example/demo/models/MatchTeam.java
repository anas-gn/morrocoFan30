package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "MatchTeam")
public class MatchTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int goals;

    @Column(name = "formation")
    private String formation;

    @ManyToOne
    @JoinColumn(name = "matchID", nullable = false)
    private Matches match;

    @ManyToOne
    @JoinColumn(name = "teamID", nullable = false)
    private Teams team;

    public MatchTeam() {
    }

    public MatchTeam(int goals, Matches m, Teams t) {
        this.goals = goals;
        this.match = m;
        this.team = t;
    }

    public MatchTeam(int goals, Matches m, Teams t, String formation) {
        this.goals = goals;
        this.match = m;
        this.team = t;
        this.formation = formation;
    }

    public int getGoals() {
        return goals;
    }

    public void setGoals(int goals) {
        this.goals = goals;
    }

    public Matches getMatch() {
        return match;
    }

    public void setMatch(Matches m) {
        this.match = m;
    }

    public Teams getTeam() {
        return team;
    }

    public void setTeam(Teams t) {
        this.team = t;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFormation() {
        return formation;
    }

    public void setFormation(String formation) {
        this.formation = formation;
    }

}