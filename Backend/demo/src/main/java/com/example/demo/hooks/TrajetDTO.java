package com.example.demo.hooks;

public class TrajetDTO {

    private int id;
    private String name;
    private String description;
    private Float priceProxim;
    private int cityHostFromID;
    private String cityHostFromName;
    private int cityHostToID;
    private String cityHostToName;

    public TrajetDTO() {
    }

    public TrajetDTO(String name, String description, Float priceProxim,
            int cityHostFromID, String cityHostFromName, int cityHostToID, String cityHostToName) {

        this.name = name;
        this.description = description;
        this.priceProxim = priceProxim;
        this.cityHostFromID = cityHostFromID;
        this.cityHostFromName = cityHostFromName;
        this.cityHostToID = cityHostToID;
        this.cityHostToName = cityHostToName;
    }

    // Getters et Setters
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

    public int getCityHostFromID() {
        return cityHostFromID;
    }

    public void setCityHostFromID(int cityHostFromID) {
        this.cityHostFromID = cityHostFromID;
    }

    public String getCityHostFromName() {
        return cityHostFromName;
    }

    public void setCityHostFromName(String cityHostFromName) {
        this.cityHostFromName = cityHostFromName;
    }

    public int getCityHostToID() {
        return cityHostToID;
    }

    public void setCityHostToID(int cityHostToID) {
        this.cityHostToID = cityHostToID;
    }

    public String getCityHostToName() {
        return cityHostToName;
    }

    public void setCityHostToName(String cityHostToName) {
        this.cityHostToName = cityHostToName;
    }

    public String getTrajetName() {
        return this.cityHostFromName + " → " + this.cityHostToName;
    }
}