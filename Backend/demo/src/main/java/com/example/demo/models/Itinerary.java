package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private int duration;

    @ManyToMany
    @JoinTable(
        name = "itinerary_attractions",
        joinColumns = @JoinColumn(name = "itinerary_id"),
        inverseJoinColumns = @JoinColumn(name = "attraction_id")
    )
    private List<Attraction> attractions;

    public Itinerary() {}

    public Itinerary(String title, int duration) {
        this.title = title;
        this.duration = duration;
    }

    // ✅ Getters & Setters
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }
 
    public void setTitle(String title) {
        this.title = title;
    }
 
    public int getDuration() {
        return duration;
    }
 
    public void setDuration(int duration) {
        this.duration = duration;
    }

    public List<Attraction> getAttractions() {
        return attractions;
    }
 
    public void setAttractions(List<Attraction> attractions) {
        this.attractions = attractions;
    }
}
