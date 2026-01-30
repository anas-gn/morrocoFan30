package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Reviews")
public class Reviews {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private Integer rating;

    @Column(name = "dateOfCreation")
    private LocalDateTime dateOfCreation = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "supporterID", nullable = false)
    private Supporters supporter;

    @ManyToOne
    @JoinColumn(name = "matchID", nullable = false)
    private Matches match;

    public Reviews() {
    }

    public Reviews(String description, Integer rating, LocalDateTime dateOfCreation, Supporters supporter, Matches match) {
        this.description = description;
        this.rating = rating;
        this.dateOfCreation = dateOfCreation;
        this.supporter = supporter;
        this.match = match;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public LocalDateTime getDateOfCreation() {
        return dateOfCreation;
    }

    public void setDateOfCreation(LocalDateTime dateOfCreation) {
        this.dateOfCreation = dateOfCreation;
    }

    public Supporters getSupporter() {
        return supporter;
    }

    public void setSupporter(Supporters supporter) {
        this.supporter = supporter;
    }

    public Matches getMatch() {
        return match;
    }

    public void setMatch(Matches match) {
        this.match = match;
    }
}
