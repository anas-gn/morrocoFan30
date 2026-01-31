package com.example.demo.hooks;

import java.time.LocalDateTime;

public class PredictionDTO {
    private int id;
    private int matchId;
    private int supporterId;
    private int predictedWinnerId;
    private String predictedWinnerName;
    private LocalDateTime dateOfPrediction;
    private int points;
    private String status;

    private String team1Name;
    private String team2Name;
    private String matchStatus;

    public PredictionDTO() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public int getPredictedWinnerId() {
        return predictedWinnerId;
    }

    public void setPredictedWinnerId(int predictedWinnerId) {
        this.predictedWinnerId = predictedWinnerId;
    }

    public String getPredictedWinnerName() {
        return predictedWinnerName;
    }

    public void setPredictedWinnerName(String predictedWinnerName) {
        this.predictedWinnerName = predictedWinnerName;
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

    public String getTeam1Name() {
        return team1Name;
    }

    public void setTeam1Name(String team1Name) {
        this.team1Name = team1Name;
    }

    public String getTeam2Name() {
        return team2Name;
    }

    public void setTeam2Name(String team2Name) {
        this.team2Name = team2Name;
    }

    public String getMatchStatus() {
        return matchStatus;
    }

    public void setMatchStatus(String matchStatus) {
        this.matchStatus = matchStatus;
    }
}