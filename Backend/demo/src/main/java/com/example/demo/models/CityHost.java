package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class CityHost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String country;

    @OneToMany(mappedBy = "cityHost", cascade = CascadeType.ALL)
    private List<Hotel> hotels;

    @OneToMany(mappedBy = "cityHost", cascade = CascadeType.ALL)
    private List<Attraction> attractions;

    // ✅ Constructeurs
    public CityHost() {}

    public CityHost(String name, String description, String country) {
        this.name = name;
        this.description = description;
        this.country = country;
    }

    // ✅ Getters & Setters
    public Long getId() {
        return id;
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

    public String getCountry() {
        return country;
    }
 
    public void setCountry(String country) {
        this.country = country;
    }

    public List<Hotel> getHotels() {
        return hotels;
    }

    public void setHotels(List<Hotel> hotels) {
        this.hotels = hotels;
    }

    public List<Attraction> getAttractions() {
        return attractions;
    }

    public void setAttractions(List<Attraction> attractions) {
        this.attractions = attractions;
    }
}
