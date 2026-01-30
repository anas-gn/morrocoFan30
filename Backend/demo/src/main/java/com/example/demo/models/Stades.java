package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "Stades")
public class Stades {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private int capacity;
    private String country;

    @Column(length = 1000)
    private String description;

    private String videoUrl;
    private String imageUrl;
    private String adresse;
    private LocalDate dateOfConstruction;

    @OneToMany(mappedBy = "stade", cascade = CascadeType.ALL)
    private List<Matches> matches;

    @ManyToOne
    @JoinColumn(name = "cityHostID")
    private CityHosts cityHost;

    @ManyToOne
    @JoinColumn(name = "responsableID")
    private Responsables responsable;

    public Stades() {
    }

    public Stades(String name, int capacity, String country, String description,
                 String videoUrl, String imageUrl, String adresse,
                 LocalDate dateOfConstruction, CityHosts city, Responsables responsable) {
        this.name = name;
        this.capacity = capacity;
        this.country = country;
        this.description = description;
        this.videoUrl = videoUrl;
        this.imageUrl = imageUrl;
        this.adresse = adresse;
        this.dateOfConstruction = dateOfConstruction;
        this.cityHost = city;
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

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
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

    public List<Matches> getMatches() {
        return matches;
    }

    public void setMatches(List<Matches> matches) {
        this.matches = matches;
    }

    public CityHosts getCity() {
        return cityHost;
    }

    public void setCity(CityHosts city) {
        this.cityHost = city;
    }

    public Responsables getResponsable() {
        return responsable;
    }

    public void setResponsable(Responsables responsable) {
        this.responsable = responsable;
    }

    public void setId(int id) {
        this.id = id;
    }
}