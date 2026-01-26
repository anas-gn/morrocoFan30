package com.example.demo.models;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

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
    private List<Transport> transports = new ArrayList<>();

    public Route() {
    }

    public Route(String name, String description, Float priceProxim,
                  CityHost cityHostFrom, CityHost cityHostTo) {
        this.name = name;
        this.description = description;
        this.priceProxim = priceProxim;
        this.cityHostFrom = cityHostFrom;
        this.cityHostTo = cityHostTo;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    // Méthode pour maintenir la relation bidirectionnelle
    public void addTransport(Transport transport) {
        transports.add(transport);
        transport.setTrajet(this);
    }

    public void removeTransport(Transport transport) {
        transports.remove(transport);
        transport.setTrajet(null);
    }

    // Méthode pratique pour obtenir le nom complet du trajet
    public String getTrajetName() {
        return cityHostFrom.getName() + " → " + cityHostTo.getName();
    }
}