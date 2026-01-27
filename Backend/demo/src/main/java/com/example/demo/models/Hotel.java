package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "Hotels")
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String address;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String email;
    private String phone;
    private String imageUrl;
    private String urlReservation;

    @ManyToOne
    @JoinColumn(name = "cityID")
    private CityHost cityHost;

    public Hotel() {
    }

    public Hotel(String name, String address, String description) {
        this.name = name;
        this.address = address;
        this.description = description;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getUrlReservation() {
        return urlReservation;
    }

    public void setUrlReservation(String urlReservation) {
        this.urlReservation = urlReservation;
    }

    public CityHost getCityHost() {
        return cityHost;
    }

    public void setCityHost(CityHost cityHost) {
        this.cityHost = cityHost;
    }
}
