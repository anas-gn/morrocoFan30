package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "trajets")
public class Trajet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priceProxim")
    private Float priceProxim;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cityHostFromID", nullable = false)
    private CityHost cityHostFrom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cityHostToID", nullable = false)
    private CityHost cityHostTo;

    @OneToMany(mappedBy = "trajet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transport> transports;

 
    public Trajet() {
    }

    public Trajet(String name, String description, Float priceProxim, CityHost cityHostFrom, CityHost cityHostTo) {
        this.name = name;
        this.description = description;
        this.priceProxim = priceProxim;
        this.cityHostFrom = cityHostFrom;
        this.cityHostTo = cityHostTo;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Float getPriceProxim() {
        return priceProxim;
    }

    public void setPriceProxim(Float priceProxim) {
        this.priceProxim = priceProxim;
    }

    public CityHost getCityHostFrom() {
        return cityHostFrom;
    }

    public void setCityHostFrom(CityHost cityHostFrom) {
        this.cityHostFrom = cityHostFrom;
    }

    public CityHost getCityHostTo() {
        return cityHostTo;
    }

    public void setCityHostTo(CityHost cityHostTo) {
        this.cityHostTo = cityHostTo;
    }

    public List<Transport> getTransports() {
        return transports;
    }

    public void setTransports(List<Transport> transports) {
        this.transports = transports;
    }

    public void addTransport(Transport transport) {
        if (this.transports != null) {
            this.transports.add(transport);
            transport.setTrajet(this);
        }
    }

    public String getTrajetName() {
        return this.cityHostFrom.getName() + " → " + this.cityHostTo.getName();
    }
}