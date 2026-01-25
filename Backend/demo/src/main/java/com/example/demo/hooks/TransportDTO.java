package com.example.demo.hooks;

public class TransportDTO {
    private Integer id;
    private String name;
    private Float priceProxim;
    private String description;
    private Integer capacity;
    private String imageUrl;
    private Integer cityId;

    // Constructors
    public TransportDTO() {
    }

    public TransportDTO(Integer id, String name, Float priceProxim, String description,
            Integer capacity, String imageUrl, Integer cityId) {
        this.id = id;
        this.name = name;
        this.priceProxim = priceProxim;
        this.description = description;
        this.capacity = capacity;
        this.imageUrl = imageUrl;
        this.cityId = cityId;
    }

    // Getters and Setters
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

    public Integer getCityId() {
        return cityId;
    }

    public void setCityId(Integer cityId) {
        this.cityId = cityId;
    }
}
