package com.example.demo.models;

import jakarta.persistence.*;

@Entity
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    @ManyToOne
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    @ManyToOne
    @JoinColumn(name = "attraction_id")
    private Attraction attraction;

    // ✅ Constructeurs
    public Image() {}

    public Image(String url) {
        this.url = url;
    }

    // ✅ Getters & Setters
    public Long getId() {
        return id;
    }

    public String getUrl() {
        return url;
    }
 
    public void setUrl(String url) {
        this.url = url;
    }

    public Hotel getHotel() {
        return hotel;
    }
 
    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }

    public Attraction getAttraction() {
        return attraction;
    }
 
    public void setAttraction(Attraction attraction) {
        this.attraction = attraction;
    }
}
