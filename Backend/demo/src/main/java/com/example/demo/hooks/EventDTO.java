package com.example.demo.hooks;

import java.time.LocalDateTime;

public class EventDTO {
    private Integer id;
    private String name;
    private String description;
    private LocalDateTime dateOfEvent;
    private Float priceProxim;
    private String imageUrl;
    private Integer cityId;

    // Constructors
    public EventDTO() {
    }

    public EventDTO(Integer id, String name, String description, LocalDateTime dateOfEvent,
            Float priceProxim, String imageUrl, Integer cityId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.dateOfEvent = dateOfEvent;
        this.priceProxim = priceProxim;
        this.imageUrl = imageUrl;
        this.cityId = cityId;
    }

    // Getters and Setters
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
}
