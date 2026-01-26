package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "GroupTeam")
public class GroupTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int wins;
    private int draws;
    private int loses;
    private int goalsScored;
    private int goalsConceded;

    @ManyToOne
    @JoinColumn(name = "groupID")
    private Group group;

    @ManyToOne
    @JoinColumn(name = "teamID", nullable = false)
    private Team team;

    public GroupTeam() {
    }

    public GroupTeam(int wins, int draws, int loses, int goalsScored, int goalsConceded, Group group, Team team) {
        this.wins = wins;
        this.draws = draws;
        this.loses = loses;
        this.goalsScored = goalsScored;
        this.goalsConceded = goalsConceded;
        this.group = group;
        this.team = team;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        this.wins = wins;
    }

    public int getDraws() {
        return draws;
    }

    public void setDraws(int draws) {
        this.draws = draws;
    }

    public int getLoses() {
        return loses;
    }

    public void setLoses(int loses) {
        this.loses = loses;
    }

    public int getGoalsScored() {
        return goalsScored;
    }

    public void setGoalsScored(int goalsScored) {
        this.goalsScored = goalsScored;
    }

    public int getGoalsConceded() {
        return goalsConceded;
    }

    public void setGoalsConceded(int goalsConceded) {
        this.goalsConceded = goalsConceded;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }
}