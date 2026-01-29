package com.example.demo.models;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Routes")
public class Routes {

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
    private CityHosts cityHostFrom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cityHostToID", nullable = false)
    private CityHosts cityHostTo;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transports> transports = new ArrayList<>();

    public Routes() {
    }

    public Routes(String name, String description, Float priceProxim,
                  CityHosts cityHostFrom, CityHosts cityHostTo) {
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

    public CityHosts getCityHostFrom() {
        return cityHostFrom;
    }

    public void setCityHostFrom(CityHosts cityHostFrom) {
        this.cityHostFrom = cityHostFrom;
    }

    public CityHosts getCityHostTo() {
        return cityHostTo;
    }

    public void setCityHostTo(CityHosts cityHostTo) {
        this.cityHostTo = cityHostTo;
    }

    public List<Transports> getTransports() {
        return transports;
    }

    public void setTransports(List<Transports> transports) {
        this.transports = transports;
    }

    // Méthode pour maintenir la relation bidirectionnelle
    public void addTransport(Transports transport) {
        transports.add(transport);
        transport.setTrajet(this);
    }

    public void removeTransport(Transports transport) {
        transports.remove(transport);
        transport.setTrajet(null);
    }

    // Méthode pratique pour obtenir le nom complet du trajet
    public String getTrajetName() {
        return cityHostFrom.getName() + " → " + cityHostTo.getName();
    }
}