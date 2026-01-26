package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "Attractions")
public class Attraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    @OneToMany(mappedBy = "attraction")
    private List<Itinerary> itineraries;
  
    @OneToMany(mappedBy = "attraction")
    private List<Image> images;

    public Attraction() {}

    public Attraction(String name, String country, String type, double priceProxim,
                      String description, String address,
                      LocalTime houreOfOpening, LocalTime houreOfClosing,
                      CityHost cityHost) {
        this.name = name;
        this.country = country;
        this.type = type;
        this.priceProxim = priceProxim;
        this.description = description;
        this.address = address;
        this.houreOfOpening = houreOfOpening;
        this.houreOfClosing = houreOfClosing;
        this.cityHost = cityHost;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public List<Itinerary> getItineraries() { return itineraries; }
    public void setItineraries(List<Itinerary> itineraries) { this.itineraries = itineraries; }

    public List<Image> getImages() { return images; }
    public void setImages(List<Image> images) { this.images = images; }
}
