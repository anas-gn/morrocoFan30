package com.example.demo.models;

import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "Responsables")
public class Responsable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column
    private Integer age;

    @Column(length = 150, unique = true)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 255)
    private String password;

    @Column(length = 100)
    private String country;

    @Column(name = "imageUrl", length = 255)
    private String imageUrl;

    @OneToMany(mappedBy = "responsables", cascade = CascadeType.ALL)
    private List<Stade> stade;

    public Responsable(String name, Integer age, String email, String phone, String password, String country,
            String imageUrl) {
        this.name = name;
        this.age = age;
        this.email = email;
        this.phone = phone;
        this.password = password;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public List<Stade> getStade() {
        return stade;
    }

    public void setStade(List<Stade> stade) {
        this.stade = stade;
    }

}
