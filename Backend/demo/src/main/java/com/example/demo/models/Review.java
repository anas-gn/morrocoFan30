package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private Integer rating;

    @Column(name = "dateOfCreation")
    private LocalDateTime dateOfCreation;

    @ManyToOne
    @JoinColumn(name = "supporterID", nullable = false)
    private Supporter supporter;

    @ManyToOne
    @JoinColumn(name = "matchID", nullable = false)
    private Match match;

    
    public Review() {}

   
    public Review(String description, Integer rating, LocalDateTime dateOfCreation, Supporter supporter, Match match) {
        this.description = description;
        this.rating = rating;
        this.dateOfCreation = dateOfCreation;
        this.supporter = supporter;
        this.match = match;
    }

    
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public LocalDateTime getDateOfCreation() { return dateOfCreation; }
    public void setDateOfCreation(LocalDateTime dateOfCreation) { this.dateOfCreation = dateOfCreation; }
    public Supporter getSupporter() { return supporter; }
    public void setSupporter(Supporter supporter) { this.supporter = supporter; }
    public Match getMatch() { return match; }
    public void setMatch(Match match) { this.match = match; }
}
