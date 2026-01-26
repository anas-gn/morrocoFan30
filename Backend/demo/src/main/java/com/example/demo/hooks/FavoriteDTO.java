package com.example.demo.hooks;

import java.time.LocalDateTime;

public class FavoriteDTO {

    private int id;
    private LocalDateTime dateOfAdd;
    private String type;
    private int ownerId;     
    private int supporterId; 

    
    public FavoriteDTO() {}

    
    public FavoriteDTO(int id, LocalDateTime dateOfAdd, String type,
                       int ownerId, int supporterId) {
        this.id = id;
        this.dateOfAdd = dateOfAdd;
        this.type = type;
        this.ownerId = ownerId;
        this.supporterId = supporterId;
    }

    
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public LocalDateTime getDateOfAdd() { return dateOfAdd; }
    public void setDateOfAdd(LocalDateTime dateOfAdd) { this.dateOfAdd = dateOfAdd; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getOwnerId() { return ownerId; }
    public void setOwnerId(int ownerId) { this.ownerId = ownerId; }

    public int getSupporterId() { return supporterId; }
    public void setSupporterId(int supporterId) { this.supporterId = supporterId; }
}
