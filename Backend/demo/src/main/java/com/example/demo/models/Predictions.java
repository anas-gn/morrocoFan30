package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Predictions")
public class Predictions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private LocalDateTime dateOfPrediction;
    private int points;
    private String status; 

    @ManyToOne
    @JoinColumn(name = "matchID", nullable = false)
    private Matches match;

    @ManyToOne
    @JoinColumn(name = "supporterID", nullable = false)
    private Supporters supporter;

    @Column(name = "predictedWinnerID")  
    private int predictedWinnerID;

    public Predictions() {}

    public Predictions(Matches match, Supporters supporter, int predictedWinner) {
        this.match = match;
        this.supporter = supporter;
        this.predictedWinnerID = predictedWinner;
        this.dateOfPrediction = LocalDateTime.now();
        this.status = "pending";
        this.points = 0;
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

    public Matches getMatch() {
        return match;
    }

    public void setMatch(Matches match) {
        this.match = match;
    }

    public Supporters getSupporter() {
        return supporter;
    }

    public void setSupporter(Supporters supporter) {
        this.supporter = supporter;
    }

    public int getPredictedWinner() {
        return predictedWinnerID;
    }

    public void setPredictedWinner(int predictedWinner) {
        this.predictedWinnerID = predictedWinner;
    }
}