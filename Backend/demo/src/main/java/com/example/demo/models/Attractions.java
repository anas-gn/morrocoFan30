package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "Attractions")
public class Attractions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String country;
    private String type;
    private double priceProxim;
    private Double latitude;
    private Double longitude;
    private String imageUrl;


    @Column(columnDefinition = "TEXT")
    private String description;

    private String address;
    private LocalTime houreOfOpening;
    private LocalTime houreOfClosing;

    @ManyToOne
    @JoinColumn(name = "cityID")
    private CityHosts cityHost;

    public Attractions() {}

    public Attractions(String name, String type, double priceProxim) {
        this.name = name;
        this.type = type;
        this.priceProxim = priceProxim;
    }
     public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude= latitude; }

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

    public CityHosts getCityHost() { return cityHost; }
    public void setCityHost(CityHosts cityHost) { this.cityHost = cityHost; }

      public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
