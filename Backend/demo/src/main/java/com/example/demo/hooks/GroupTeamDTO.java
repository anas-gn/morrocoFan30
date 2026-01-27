package com.example.demo.hooks;

public class GroupTeamDTO {

    private int id;
    private int wins;
    private int draws;
    private int loses;
    private int goalsScored;
    private int goalsConceded;
    private int groupId;
    private int teamId;

    public GroupTeamDTO() {
    }

    public GroupTeamDTO(int wins, int draws, int loses, int goalsScored, int goalsConceded, int groupId, int teamId) {
        this.wins = wins;
        this.draws = draws;
        this.loses = loses;
        this.goalsScored = goalsScored;
        this.goalsConceded = goalsConceded;
        this.groupId = groupId;
        this.teamId = teamId;
    }

    public GroupTeamDTO(int id, int wins, int draws, int loses, int goalsScored, int goalsConceded, int groupId, int teamId) {
        this.id = id;
        this.wins = wins;
        this.draws = draws;
        this.loses = loses;
        this.goalsScored = goalsScored;
        this.goalsConceded = goalsConceded;
        this.groupId = groupId;
        this.teamId = teamId;
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

    public int getGroupId() {
        return groupId;
    }

    public void setGroupId(int groupId) {
        this.groupId = groupId;
    }

    public int getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }
}