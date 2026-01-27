package com.example.demo.hooks;

import java.time.LocalTime;

public class AttractionDTO {

    private int id;
    private String name;
    private String country;
    private String type;
    private double priceProxim;
    private String description;
    private String address;
    private LocalTime houreOfOpening;
    private LocalTime houreOfClosing;
    private int cityHostId;

    // Constructors
    public AttractionDTO() {}

    public AttractionDTO(String name, String country, String type, double priceProxim, 
                        String description, String address, LocalTime houreOfOpening, 
                        LocalTime houreOfClosing, int cityHostId) {
        this.name = name;
        this.country = country;
        this.type = type;
        this.priceProxim = priceProxim;
        this.description = description;
        this.address = address;
        this.houreOfOpening = houreOfOpening;
        this.houreOfClosing = houreOfClosing;
        this.cityHostId = cityHostId;
    }

    public AttractionDTO(int id, String name, String country, String type, double priceProxim,
                        String description, String address, LocalTime houreOfOpening,
                        LocalTime houreOfClosing, int cityHostId) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.type = type;
        this.priceProxim = priceProxim;
        this.description = description;
        this.address = address;
        this.houreOfOpening = houreOfOpening;
        this.houreOfClosing = houreOfClosing;
        this.cityHostId = cityHostId;
    }

    // Getters and Setters
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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getPriceProxim() {
        return priceProxim;
    }

    public void setPriceProxim(double priceProxim) {
        this.priceProxim = priceProxim;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalTime getHoureOfOpening() {
        return houreOfOpening;
    }

    public void setHoureOfOpening(LocalTime houreOfOpening) {
        this.houreOfOpening = houreOfOpening;
    }

    public LocalTime getHoureOfClosing() {
        return houreOfClosing;
    }

    public void setHoureOfClosing(LocalTime houreOfClosing) {
        this.houreOfClosing = houreOfClosing;
    }

    public int getCityHostId() {
        return cityHostId;
    }

    public void setCityHostId(int cityHostId) {
        this.cityHostId = cityHostId;
    }
}