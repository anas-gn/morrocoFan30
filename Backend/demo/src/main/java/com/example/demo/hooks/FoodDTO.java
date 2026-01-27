package com.example.demo.hooks;

public class FoodDTO {
    private Integer id;
    private String name;
    private String category;
    private String description;
    private Float priceProxim;
    private String imageUrl;
    private Integer cityId;

    // Constructors
    public FoodDTO() {
    }

    public FoodDTO(Integer id, String name, String category, String description,
            Float priceProxim, String imageUrl, Integer cityId) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.priceProxim = priceProxim;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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
