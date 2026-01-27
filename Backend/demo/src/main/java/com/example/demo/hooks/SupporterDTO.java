package com.example.demo.hooks;

public class SupporterDTO {

    private int id;
    private String name;
    private Integer age;
    private String email;
    private String phone;
    private String country;
    private Integer totalPoints;
    private int imageId; 

    
    public SupporterDTO() {}

    
    public SupporterDTO(int id, String name, Integer age, String email,
                        String phone, String country, Integer totalPoints, int imageId) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.email = email;
        this.phone = phone;
        this.country = country;
        this.totalPoints = totalPoints;
        this.imageId = imageId;
    }

    
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }

    public int getImageId() { return imageId; }
    public void setImageId(int imageId) { this.imageId = imageId; }
}
