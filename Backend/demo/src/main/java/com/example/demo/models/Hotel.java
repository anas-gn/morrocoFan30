package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private int stars;

    @ManyToOne
    @JoinColumn(name = "city_id")
    private CityHost cityHost;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<Image> images;

    // ✅ Constructeurs
    public Hotel() {}

    public Hotel(String name, String address, int stars) {
        this.name = name;
        this.address = address;
        this.stars = stars;
    }

    // ✅ Getters & Setters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
 
    public void setName(String name) {
        this.name = name;
    }
 
    public String getAddress() {
        return address;
    }
 
    public void setAddress(String address) {
        this.address = address;
    }
 
    public int getStars() {
        return stars;
    }
 
    public void setStars(int stars) {
        this.stars = stars;
    }

    public CityHost getCityHost() {
        return cityHost;
    }

    public void setCityHost(CityHost cityHost) {
        this.cityHost = cityHost;
    }

    public List<Image> getImages() {
        return images;
    }
 
    public void setImages(List<Image> images) {
        this.images = images;
    }
}
