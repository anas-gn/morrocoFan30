package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "MatchTeam")
public class MatchTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int goals;

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

}