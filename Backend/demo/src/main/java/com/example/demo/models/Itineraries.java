package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "Itineraries")
public class Itineraries {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate dateToGo;

   
    // RELATION AVEC SUPPORTER
   
    @ManyToOne
    @JoinColumn(name = "supporterID", nullable = false)
    private Supporters supporter;

   
    // RELATION AVEC ATTRACTIONS
    // Table : ItineraryAttraction
  
    @ManyToMany
    @JoinTable(
        name = "ItineraryAttraction",
        joinColumns = @JoinColumn(name = "itineraryID"),
        inverseJoinColumns = @JoinColumn(name = "attractionID")
    )
    private List<Attractions> attractions;

    
    // CONSTRUCTEURS
   
    public Itineraries() {
    }

    public Itineraries(String title, String description, LocalDate dateToGo, Supporters supporter) {
        this.title = title;
        this.description = description;
        this.dateToGo = dateToGo;
        this.supporter = supporter;
    }

    
    // GETTERS & SETTERS
    
    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public Supporters getSupporter() {
        return supporter;
    }

    public void setSupporter(Supporters supporter) {
        this.supporter = supporter;
    }

    public List<Attractions> getAttractions() {
        return attractions;
    }

    public void setAttractions(List<Attractions> attractions) {
        this.attractions = attractions;
    }
}
