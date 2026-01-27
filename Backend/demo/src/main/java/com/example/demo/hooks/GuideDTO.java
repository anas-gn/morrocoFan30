package com.example.demo.hooks;

public class GuideDTO {

    private int id;
    private String name;
    private String address;
    private String description;
    private String email;
    private String phone;
    private String imageUrl;
    private String languages;
    private int cityId;

    public GuideDTO() {
    }

    public GuideDTO(String name, String address, String description, String email, String phone, String imageUrl, String languages, int cityId) {
        this.name = name;
        this.address = address;
        this.description = description;
        this.email = email;
        this.phone = phone;
        this.imageUrl = imageUrl;
        this.languages = languages;
        this.cityId = cityId;
    }

    public GuideDTO(int id, String name, String address, String description, String email, String phone, String imageUrl, String languages, int cityId) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.description = description;
        this.email = email;
        this.phone = phone;
        this.imageUrl = imageUrl;
        this.languages = languages;
        this.cityId = cityId;
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

    public String getLanguages() {
        return languages;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
    }

    public int getCityId() {
        return cityId;
    }

    public void setCityId(int cityId) {
        this.cityId = cityId;
    }
}