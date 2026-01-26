package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "Itineraries")
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;

<<<<<<< HEAD
    @ManyToMany
    @JoinTable(
        name = "itineraryAttractions",
        joinColumns = @JoinColumn(name = "itineraryID"),
        inverseJoinColumns = @JoinColumn(name = "attractionID")
    )
    private List<Attraction> attractions;
=======
    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate dateToGo;

    @ManyToOne
    @JoinColumn(name = "attractionID")
    private Attraction attraction;
>>>>>>> b1837e31a7e6199f889fe30dcb066242de7bea11

    public Itinerary() {}

    public Itinerary(String title, String description, LocalDate dateToGo) {
        this.title = title;
        this.description = description;
        this.dateToGo = dateToGo;
    }

<<<<<<< HEAD
    // ✅ Getters & Setters
    public int getId() {
        return id;
    }
=======
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
>>>>>>> b1837e31a7e6199f889fe30dcb066242de7bea11

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDateToGo() { return dateToGo; }
    public void setDateToGo(LocalDate dateToGo) { this.dateToGo = dateToGo; }

    public Attraction getAttraction() { return attraction; }
    public void setAttraction(Attraction attraction) { this.attraction = attraction; }
}
