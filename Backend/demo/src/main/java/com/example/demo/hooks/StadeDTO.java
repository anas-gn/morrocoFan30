package com.example.demo.hooks;

import java.time.LocalDate;

public class StadeDTO {

    private int id;

    private String name;
    private double capacity;
    private String country;
    private String description;
    private String videoUrl;
    private String imageUrl;
    private String adresse;
    private LocalDate dateOfConstruction;
    private int cityId;
    private int responsableId;

    public StadeDTO() {
    }

    public StadeDTO(String name, double capacity, String country, String description,
            String videoUrl, String imageUrl, String adresse,
            LocalDate dateOfConstruction, int cit, int respo) {
        this.name = name;
        this.capacity = capacity;
        this.country = country;
        this.description = description;
        this.videoUrl = videoUrl;
        this.imageUrl = imageUrl;
        this.adresse = adresse;
        this.dateOfConstruction = dateOfConstruction;
        this.cityId = cit;
        this.responsableId = respo;
    }

    public int getCityId() {
        return cityId;
    }

    public void setCityId(int cityId) {
        this.cityId = cityId;
    }

    public int getResponsableId() {
        return responsableId;
    }

    public void setResponsableId(int responsableId) {
        this.responsableId = responsableId;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getCapacity() {
        return capacity;
    }

    public void setCapacity(double capacity) {
        this.capacity = capacity;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public LocalDate getDateOfConstruction() {
        return dateOfConstruction;
    }

    public void setDateOfConstruction(LocalDate dateOfConstruction) {
        this.dateOfConstruction = dateOfConstruction;
    }

    public void setId(int id) {
        this.id = id;
    }

}