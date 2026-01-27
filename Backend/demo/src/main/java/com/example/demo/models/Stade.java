package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "stades")
public class Stade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private double capacity;
    private String country;

    @Column(length = 1000)
    private String description;

    private String videoUrl;
    private String imageUrl;
    private String adresse;
    private LocalDate dateOfConstruction;

    @OneToMany(mappedBy = "stadeID", cascade = CascadeType.ALL)
    private List<Match> matches;

    @ManyToOne
    @JoinColumn(name = "cityHostID")
    private CityHost city;

    @ManyToOne
    @JoinColumn(name = "responsableID")
    private Responsable responsable;

    public Stade() {
    }

    public Stade(String name, double capacity, String country, String description,
                 String videoUrl, String imageUrl, String adresse,
                 LocalDate dateOfConstruction, CityHost city, Responsable responsable) {
        this.name = name;
        this.capacity = capacity;
        this.country = country;
        this.description = description;
        this.videoUrl = videoUrl;
        this.imageUrl = imageUrl;
        this.adresse = adresse;
        this.dateOfConstruction = dateOfConstruction;
        this.city = city;
        this.responsable = responsable;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getCapacity() {
        return capacity;
    }

    public void setCapacity(double capacity) {
        this.capacity = capacity;
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

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public LocalDate getDateOfConstruction() {
        return dateOfConstruction;
    }

    public void setDateOfConstruction(LocalDate dateOfConstruction) {
        this.dateOfConstruction = dateOfConstruction;
    }

    public List<Match> getMatches() {
        return matches;
    }

    public void setMatches(List<Match> matches) {
        this.matches = matches;
    }

    public CityHost getCity() {
        return city;
    }

    public void setCity(CityHost city) {
        this.city = city;
    }

    public Responsable getResponsable() {
        return responsable;
    }

    public void setResponsable(Responsable responsable) {
        this.responsable = responsable;
    }
}