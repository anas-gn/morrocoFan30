package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "Attractions")
public class Attraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String country;
    private String type;
    private double priceProxim;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String address;
    private LocalTime houreOfOpening;
    private LocalTime houreOfClosing;

    @ManyToOne
    @JoinColumn(name = "cityID")
    private CityHost cityHost;

    public Attraction() {}

    public Attraction(String name, String type, double priceProxim) {
        this.name = name;
        this.type = type;
        this.priceProxim = priceProxim;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getPriceProxim() { return priceProxim; }
    public void setPriceProxim(double priceProxim) { this.priceProxim = priceProxim; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalTime getHoureOfOpening() { return houreOfOpening; }
    public void setHoureOfOpening(LocalTime houreOfOpening) { this.houreOfOpening = houreOfOpening; }

    public LocalTime getHoureOfClosing() { return houreOfClosing; }
    public void setHoureOfClosing(LocalTime houreOfClosing) { this.houreOfClosing = houreOfClosing; }

    public CityHost getCityHost() { return cityHost; }
    public void setCityHost(CityHost cityHost) { this.cityHost = cityHost; }
}
