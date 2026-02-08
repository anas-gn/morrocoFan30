package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "MatchEvents")
public class MatchEvents {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "matchID", nullable = false)
    private int matchID;

    @Column(name = "playerID", nullable = false)
    private int playerID;

    @Column(name = "teamID", nullable = false)
    private int teamID;

    @Column(name = "minute")
    private Integer minute;

    @Column(name = "additionalInfo")
    private String additionalInfo;

    public MatchEvents() {
    }

    public MatchEvents(int matchID, int playerID, int teamID, Integer minute) {
        this.matchID = matchID;
        this.playerID = playerID;
        this.teamID = teamID;

        this.minute = minute;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getMatchID() {
        return matchID;
    }

    public void setMatchID(int matchID) {
        this.matchID = matchID;
    }

    public int getPlayerID() {
        return playerID;
    }

    public void setPlayerID(int playerID) {
        this.playerID = playerID;
    }

    public int getTeamID() {
        return teamID;
    }

    public void setTeamID(int teamID) {
        this.teamID = teamID;
    }

    public Integer getMinute() {
        return minute;
    }

    public void setMinute(Integer minute) {
        this.minute = minute;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }
}