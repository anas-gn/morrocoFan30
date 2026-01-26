package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "dateOfEvent")
    private LocalDateTime dateOfEvent;

    @Column(name = "priceProxim")
    private Float priceProxim;

    @Column(name = "imageUrl", length = 255)
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "cityID")
    private CityHost city;

    @Transient
    private List<Image> images;

    // Constructors
    public Event() {}

    public Event( String name, String description,
                 LocalDateTime dateOfEvent, Float priceProxim, CityHost city) {
        this.name = name;
        this.description = description;
        this.dateOfEvent = dateOfEvent;
        this.priceProxim = priceProxim;
        this.city = city;
    }

    // Getters & Setters

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

    public CityHost getCity() {
        return city;
    }

    public void setCity(CityHost city) {
        this.city = city;
    }

    public List<Image> getImages() {
        return images;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }
}
