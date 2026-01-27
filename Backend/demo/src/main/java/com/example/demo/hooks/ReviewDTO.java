package com.example.demo.hooks;

import java.time.LocalDateTime;

public class ReviewDTO {

    private int id;
    private String description;
    private Integer rating;
    private LocalDateTime dateOfCreation;
    private int supporterId; 
    private int matchId;     

    
    public ReviewDTO() {}

    
    public ReviewDTO(int id, String description, Integer rating,
                     LocalDateTime dateOfCreation, int supporterId, int matchId) {
        this.id = id;
        this.description = description;
        this.rating = rating;
        this.dateOfCreation = dateOfCreation;
        this.supporterId = supporterId;
        this.matchId = matchId;
    }

    
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public LocalDateTime getDateOfCreation() { return dateOfCreation; }
    public void setDateOfCreation(LocalDateTime dateOfCreation) { this.dateOfCreation = dateOfCreation; }

    public int getSupporterId() { return supporterId; }
    public void setSupporterId(int supporterId) { this.supporterId = supporterId; }

    public int getMatchId() { return matchId; }
    public void setMatchId(int matchId) { this.matchId = matchId; }
}
