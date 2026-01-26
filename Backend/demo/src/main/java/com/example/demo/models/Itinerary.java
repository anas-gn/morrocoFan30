package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "Itineraries")
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate dateToGo;

 
    @ManyToOne
    @JoinColumn(name = "supporterID")
    private Supporter supporter;

    
    @ManyToMany
    @JoinTable(
        name = "itinerary_attraction",
        joinColumns = @JoinColumn(name = "itineraryID"),
        inverseJoinColumns = @JoinColumn(name = "attractionID")
    )
    private List<Attraction> attractions;

       
    public Itinerary() {}

    public Itinerary(String title, String description, LocalDate dateToGo, Supporter supporter) {
        this.title = title;
        this.description = description;
        this.dateToGo = dateToGo;
        this.supporter = supporter;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDateToGo() {
        return dateToGo;
    }

    public void setDateToGo(LocalDate dateToGo) {
        this.dateToGo = dateToGo;
    }

    public Supporter getSupporter() {
        return supporter;
    }

    public void setSupporter(Supporter supporter) {
        this.supporter = supporter;
    }

    public List<Attraction> getAttractions() {
        return attractions;
    }

    public void setAttractions(List<Attraction> attractions) {
        this.attractions = attractions;
    }
}