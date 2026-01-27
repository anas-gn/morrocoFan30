package com.example.demo.hooks;

public class CityHostDTO {

    private int id;
    private String name;
    private String country;
    private String description;
    private String region;

    public CityHostDTO() {
    }

    public CityHostDTO(String name, String country, String description, String region) {
        this.name = name;
        this.country = country;
        this.description = description;
        this.region = region;
    }

    public CityHostDTO(int id, String name, String country, String description, String region) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.description = description;
        this.region = region;
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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }
}