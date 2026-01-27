package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "dateOfEvent")
    private LocalDateTime dateOfEvent;

    @Column(name = "priceProxim")
    private Float priceProxim;

    @Column(name = "imageUrl", length = 255)
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "cityID", referencedColumnName = "id")
    private CityHost city;

    // Constructors
    public Event() {
    }

    public Event(Integer id, String name, String description, LocalDateTime dateOfEvent,
                 Float priceProxim, String imageUrl, CityHost city) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.dateOfEvent = dateOfEvent;
        this.priceProxim = priceProxim;
        this.imageUrl = imageUrl;
        this.city = city;
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

    public CityHost getCity() {
        return city;
    }

    public void setCity(CityHost city) {
        this.city = city;
    }
}
   
