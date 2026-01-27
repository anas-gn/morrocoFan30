package com.example.demo.hooks;

import java.time.LocalDate;

public class ItineraryDTO {

    private int id;
    private String title;
    private String description;
    private LocalDate dateToGo;
    private int supporterId;

    public ItineraryDTO() {
    }

    public ItineraryDTO(String title, String description, LocalDate dateToGo, int supporterId) {
        this.title = title;
        this.description = description;
        this.dateToGo = dateToGo;
        this.supporterId = supporterId;
    }

    public ItineraryDTO(int id, String title, String description, LocalDate dateToGo, int supporterId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dateToGo = dateToGo;
        this.supporterId = supporterId;
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
}