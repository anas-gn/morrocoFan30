package com.example.demo.hooks;

import java.time.LocalDateTime;

public class ReviewDTO {

    private Long id;
    private String description;
    private Integer rating;
    private LocalDateTime dateOfCreation;
    private Long supporterId; 
    private Long matchId;     

    
    public ReviewDTO() {}

    
    public ReviewDTO(Long id, String description, Integer rating,
                     LocalDateTime dateOfCreation, Long supporterId, Long matchId) {
        this.id = id;
        this.description = description;
        this.rating = rating;
        this.dateOfCreation = dateOfCreation;
        this.supporterId = supporterId;
        this.matchId = matchId;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public LocalDateTime getDateOfCreation() { return dateOfCreation; }
    public void setDateOfCreation(LocalDateTime dateOfCreation) { this.dateOfCreation = dateOfCreation; }

    public Long getSupporterId() { return supporterId; }
    public void setSupporterId(Long supporterId) { this.supporterId = supporterId; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
}
