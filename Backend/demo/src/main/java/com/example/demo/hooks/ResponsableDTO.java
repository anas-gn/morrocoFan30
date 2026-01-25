package com.example.demo.hooks;

public class ResponsableDTO {

    private Long id;
    private String name;
    private Integer age;
    private String email;
    private String phone;
    private String country;
    private String imageUrl;

    public ResponsableDTO() {
    }

    public ResponsableDTO(Long id, String name, Integer age, String email, String phone, String country,
            String imageUrl) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.email = email;
        this.phone = phone;
        this.country = country;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}