package com.example.demo.hooks;

public class TransportDTO {

    private Integer id;
    private String name;
    private Float priceProxim;
    private String description;
    private Integer capacity;
    private String imageUrl;
    private Integer cityID;
    private String cityName;
    private Integer trajetID;
    private String trajetName;

    public TransportDTO() {
    }

    public TransportDTO(String name, Float priceProxim, String description,
            Integer capacity, String imageUrl, Integer cityID, String cityName,
            Integer trajetID, String trajetName) {

        this.name = name;
        this.priceProxim = priceProxim;
        this.description = description;
        this.capacity = capacity;
        this.imageUrl = imageUrl;
        this.cityID = cityID;
        this.cityName = cityName;
        this.trajetID = trajetID;
        this.trajetName = trajetName;
    }

    // Constructeur sans trajet
    public TransportDTO(Integer id, String name, Float priceProxim, String description,
            Integer capacity, String imageUrl, Integer cityID, String cityName) {
        this.id = id;
        this.name = name;
        this.priceProxim = priceProxim;
        this.description = description;
        this.capacity = capacity;
        this.imageUrl = imageUrl;
        this.cityID = cityID;
        this.cityName = cityName;
        this.trajetID = null;
        this.trajetName = null;
    }

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Float getPriceProxim() {
        return priceProxim;
    }

    public void setPriceProxim(Float priceProxim) {
        this.priceProxim = priceProxim;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getCityID() {
        return cityID;
    }

    public void setCityID(Integer cityID) {
        this.cityID = cityID;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public Integer getTrajetID() {
        return trajetID;
    }

    public void setTrajetID(Integer trajetID) {
        this.trajetID = trajetID;
    }

    public String getTrajetName() {
        return trajetName;
    }

    public void setTrajetName(String trajetName) {
        this.trajetName = trajetName;
    }
}