package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDate;

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
    @JoinColumn(name = "attractionID")
    private Attraction attraction;

    public Itinerary() {}

    public Itinerary(String title, String description, LocalDate dateToGo) {
        this.title = title;
        this.description = description;
        this.dateToGo = dateToGo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDateToGo() { return dateToGo; }
    public void setDateToGo(LocalDate dateToGo) { this.dateToGo = dateToGo; }

    public Attraction getAttraction() { return attraction; }
    public void setAttraction(Attraction attraction) { this.attraction = attraction; }
}
