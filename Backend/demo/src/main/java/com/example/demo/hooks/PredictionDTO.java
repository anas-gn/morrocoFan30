package com.example.demo.hooks;

import java.time.LocalDateTime;

public class PredictionDTO {

    private int id;
    private LocalDateTime dateOfPrediction;
    private int points;
    private String status;
    private int matchId;
    private int supporterId;
    private String supportName;
    private String teamName;

    public PredictionDTO() {
    }

    public PredictionDTO(String t,String n,LocalDateTime dateOfPrediction, int points, String status, int matchId, int supporterId) {
        this.dateOfPrediction = dateOfPrediction;
        this.points = points;
        this.status = status;
        this.supportName=n;
        this.teamName=t;
        this.matchId = matchId;
        this.supporterId = supporterId;
    }

    public PredictionDTO(int id, LocalDateTime dateOfPrediction, int points, String status, int matchId, int supporterId) {
        this.id = id;
        this.dateOfPrediction = dateOfPrediction;
        this.points = points;
        this.status = status;
        this.matchId = matchId;
        this.supporterId = supporterId;
    }

    public String getSupportName() {
        return supportName;
    }

    public void setSupportName(String supportName) {
        this.supportName = supportName;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDateTime getDateOfPrediction() {
        return dateOfPrediction;
    }

    public void setDateOfPrediction(LocalDateTime dateOfPrediction) {
        this.dateOfPrediction = dateOfPrediction;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getMatchId() {
        return matchId;
    }

    public void setMatchId(int matchId) {
        this.matchId = matchId;
    }

    public int getSupporterId() {
        return supporterId;
    }

    public void setSupporterId(int supporterId) {
        this.supporterId = supporterId;
    }
}