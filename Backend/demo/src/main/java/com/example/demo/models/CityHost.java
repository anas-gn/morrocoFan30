package com.example.demo.models;
import jakarta.persistence.*;


import java.util.List;

@Entity
@Table(name = "CityHosts")
public class CityHost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String country;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String region;

    @OneToMany(mappedBy = "cityHost")
    private List<Attraction> attractions;

    @OneToMany(mappedBy = "cityHost")
    private List<Event> events;

    @OneToMany(mappedBy = "cityHost")
    private List<Transport> transports;

    @OneToMany(mappedBy = "cityHost")
    private List<Food> foods;

    @OneToMany(mappedBy = "cityHost")
    private List<Hotel> hotels;

    @OneToMany(mappedBy = "cityHost")
    private List<Guide> guides;

    @OneToMany(mappedBy = "cityHost")
    private List<Stade> stades;
    public CityHost() {}
    public CityHost(String name, String country, String description, String region) {
        this.name = name;
        this.country = country;
        this.description = description;
        this.region = region;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public List<Attraction> getAttractions() { return attractions; }
    public void setAttractions(List<Attraction> attractions) { this.attractions = attractions; }

    public List<Event> getEvents() { return events; }
    public void setEvents(List<Event> events) { this.events = events; }

    public List<Transport> getTransports() { return transports; }
    public void setTransports(List<Transport> transports) { this.transports = transports; }

    public List<Food> getFoods() { return foods; }
    public void setFoods(List<Food> foods) { this.foods = foods; }

    public List<Hotel> getHotels() { return hotels; }
    public void setHotels(List<Hotel> hotels) { this.hotels = hotels; }

    public List<Guide> getGuides() { return guides; }
    public void setGuides(List<Guide> guides) { this.guides = guides; }

    public List<Stade> getStades() { return stades; }
    public void setStades(List<Stade> stades) { this.stades = stades; }
}
