package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "CityHosts")
public class CityHost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String country;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String region;

    @OneToMany(mappedBy = "cityHost")
    private List<Hotel> hotels;

    @OneToMany(mappedBy = "cityHost")
    private List<Attraction> attractions;

    public CityHost() {}

    public CityHost(String name, String country, String description, String region) {
        this.name = name;
        this.country = country;
        this.description = description;
        this.region = region;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public List<Hotel> getHotels() { return hotels; }
    public void setHotels(List<Hotel> hotels) { this.hotels = hotels; }

    public List<Attraction> getAttractions() { return attractions; }
    public void setAttractions(List<Attraction> attractions) { this.attractions = attractions; }
}
