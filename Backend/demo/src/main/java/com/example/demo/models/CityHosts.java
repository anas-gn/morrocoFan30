package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "CityHosts")
public class CityHosts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String country;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String region;

    @OneToMany(mappedBy = "cityHost")
    private List<Hotels> hotels;

    @OneToMany(mappedBy = "cityHost")
    private List<Attractions> attractions;

    @OneToMany(mappedBy = "cityHost")
    private List<Stades> stades;

    private String imageUrl;

    public CityHosts() {
    }

    public CityHosts(String name, String country, String description, String region, String imageUrl) {
        this.imageUrl = imageUrl;
        this.name = name;
        this.country = country;
        this.description = description;
        this.region = region;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public List<Hotels> getHotels() {
        return hotels;
    }

    public void setHotels(List<Hotels> hotels) {
        this.hotels = hotels;
    }

    public List<Stades> getStades() {
        return stades;
    }

    public void setStades(List<Stades> stades) {
        this.stades = stades;
    }

    public List<Attractions> getAttractions() {
        return attractions;
    }

    public void setAttractions(List<Attractions> attractions) {
        this.attractions = attractions;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
