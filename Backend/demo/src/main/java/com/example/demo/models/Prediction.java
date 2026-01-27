package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Predictions")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private LocalDateTime dateOfPrediction;
    private int points;
    private String status;

    @ManyToOne
    @JoinColumn(name = "matchID", nullable = false)
    private Match match;

    @ManyToOne
    @JoinColumn(name = "supporterID", nullable = false)
    private Supporter supporter;

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

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match match) {
        this.match = match;
    }

    public Supporter getSupporter() {
        return supporter;
    }

    public void setSupporter(Supporter supporter) {
        this.supporter = supporter;
    }
}