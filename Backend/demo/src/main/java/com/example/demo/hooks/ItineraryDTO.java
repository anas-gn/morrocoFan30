package com.example.demo.hooks;

import java.time.LocalDate;

public class ItineraryDTO {

    private int id;
    private String title;
    private String description;
    private LocalDate dateToGo;
    private int supporterId;
    private String supportName;

    public ItineraryDTO() {
    }

    public ItineraryDTO(String title, String description, LocalDate dateToGo, int supporterId,String sup) {
        this.title = title;
        this.description = description;
        this.dateToGo = dateToGo;
        this.supporterId = supporterId;
        this.supportName=sup;
    }

    public ItineraryDTO(int id, String title, String description, LocalDate dateToGo, int supporterId,String sup) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dateToGo = dateToGo;
        this.supporterId = supporterId;
        this.supportName=sup;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDateToGo() {
        return dateToGo;
    }

    public void setDateToGo(LocalDate dateToGo) {
        this.dateToGo = dateToGo;
    }

    public int getSupporterId() {
        return supporterId;
    }

    public void setSupporterId(int supporterId) {
        this.supporterId = supporterId;
    }

    public String getSupportName() {
        return supportName;
    }

    public void setSupportName(String supportName) {
        this.supportName = supportName;
    }
}