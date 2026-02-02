 package com.example.demo.hooks;

import java.time.LocalDateTime;
import java.util.List;

public class EventDTO {

    private Integer id;
    private String name;
    private String description;
    private LocalDateTime dateOfEvent;
    private Float priceProxim;
    private String imageUrl;
    private Integer cityId;
    private String cityName;
    private List<String> images;

    // 🔹 Constructeur vide (obligatoire pour Jackson)
    public EventDTO() {
    }

    // 🔹 Constructeur COMPLET (utilisé par le Controller)
    public EventDTO(
            Integer id,
            String name,
            String description,
            LocalDateTime dateOfEvent,
            Float priceProxim,
            String imageUrl,
            Integer cityId,
            String cityName,
            List<String> images) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.dateOfEvent = dateOfEvent;
        this.priceProxim = priceProxim;
        this.imageUrl = imageUrl;
        this.cityId = cityId;
        this.cityName = cityName;
        this.images = images;
    }

    // =====================
    // Getters & Setters
    // =====================

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDateOfEvent() {
        return dateOfEvent;
    }

    public void setDateOfEvent(LocalDateTime dateOfEvent) {
        this.dateOfEvent = dateOfEvent;
    }

    public Float getPriceProxim() {
        return priceProxim;
    }

    public void setPriceProxim(Float priceProxim) {
        this.priceProxim = priceProxim;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getCityId() {
        return cityId;
    }

    public void setCityId(Integer cityId) {
        this.cityId = cityId;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }
}
