package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "Transports")
public class Transport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "priceProxim")
    private Float priceProxim;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "imageUrl", length = 255)
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "cityID", referencedColumnName = "id")
    private CityHost city;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "routesID", nullable = true)
    private Trajet trajet;

    public Transport(String name, Float priceProxim, String description, Integer capacity, String imageUrl,
            CityHost city, Trajet trajet) {
        this.name = name;
        this.priceProxim = priceProxim;
        this.description = description;
        this.capacity = capacity;
        this.imageUrl = imageUrl;
        this.city = city;
        this.trajet = trajet;
    }

    // Constructors
    public Transport() {
    }

    public Transport(String name, Float priceProxim, String description,
            Integer capacity, String imageUrl, CityHost city) {

        this.name = name;
        this.priceProxim = priceProxim;
        this.description = description;
        this.capacity = capacity;
        this.imageUrl = imageUrl;
        this.city = city;
        this.trajet = null;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Float getPriceProxim() {
        return priceProxim;
    }

    public void setPriceProxim(Float priceProxim) {
        this.priceProxim = priceProxim;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public CityHost getCity() {
        return city;
    }

    public void setCity(CityHost city) {
        this.city = city;
    }

    public Trajet getTrajet() {
        return trajet;
    }

    public void setTrajet(Trajet trajet) {
        this.trajet = trajet;
    }
}
