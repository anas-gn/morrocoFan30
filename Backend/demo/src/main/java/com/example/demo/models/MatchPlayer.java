package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "MatchPlayer")
public class MatchPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "matchID", nullable = false)
    private int matchID;

    @Column(name = "teamID", nullable = false)
    private int teamID;

    @Column(name = "playerID", nullable = false)
    private int playerID;

    @Column(name = "isStarter")
    private boolean isStarter;

    @Column(name = "position")
    private String position;

    @Column(name = "jerseyNumber")
    private Integer jerseyNumber;

    @Column(name = "minutesPlayed")
    private Integer minutesPlayed;

    @Column(name = "rating")
    private Double rating;

    public MatchPlayer() {
    }

    public MatchPlayer(int matchID, int teamID, int playerID, boolean isStarter, String position) {
        this.matchID = matchID;
        this.teamID = teamID;
        this.playerID = playerID;
        this.isStarter = isStarter;
        this.position = position;
        this.rating=0.0;
        this.minutesPlayed=0;
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

    public int getTeamID() {
        return teamID;
    }

    public void setTeamID(int teamID) {
        this.teamID = teamID;
    }

    public int getPlayerID() {
        return playerID;
    }

    public void setPlayerID(int playerID) {
        this.playerID = playerID;
    }

    public boolean isStarter() {
        return isStarter;
    }

    public void setStarter(boolean starter) {
        isStarter = starter;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public Integer getJerseyNumber() {
        return jerseyNumber;
    }

    public void setJerseyNumber(Integer jerseyNumber) {
        this.jerseyNumber = jerseyNumber;
    }

    public Integer getMinutesPlayed() {
        return minutesPlayed;
    }

    public void setMinutesPlayed(Integer minutesPlayed) {
        this.minutesPlayed = minutesPlayed;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}