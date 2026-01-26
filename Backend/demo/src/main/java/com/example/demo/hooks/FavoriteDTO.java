package com.example.demo.hooks;

import java.time.LocalDateTime;

public class FavoriteDTO {

    private Long id;
    private LocalDateTime dateOfAdd;
    private String type;
    private Long ownerId;     
    private Long supporterId; 

    
    public FavoriteDTO() {}

    
    public FavoriteDTO(Long id, LocalDateTime dateOfAdd, String type,
                       Long ownerId, Long supporterId) {
        this.id = id;
        this.dateOfAdd = dateOfAdd;
        this.type = type;
        this.ownerId = ownerId;
        this.supporterId = supporterId;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDateOfAdd() { return dateOfAdd; }
    public void setDateOfAdd(LocalDateTime dateOfAdd) { this.dateOfAdd = dateOfAdd; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public Long getSupporterId() { return supporterId; }
    public void setSupporterId(Long supporterId) { this.supporterId = supporterId; }
}
