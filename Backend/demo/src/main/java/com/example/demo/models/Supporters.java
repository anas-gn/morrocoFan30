package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Supporters")
public class Supporters {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

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

    @Column(name = "totalPoints", columnDefinition = "INT DEFAULT 0")
    private Integer totalPoints;


    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorites> favorites;

    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Predictions> predictions;

    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reviews> reviews;

    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reports> reports;

    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Messages> messages;

    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notifications> notifications;

    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Itineraries> itineraries;

    public Supporters() {
    }

    public Supporters(String name, Integer age, String email, String phone, String password, String country,
            Integer totalPoints) {
        this.name = name;
        this.age = age;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.country = country;
        this.totalPoints = totalPoints;
       
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

    public Integer getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }

    

    public List<Favorites> getFavorites() {
        return favorites;
    }

    public void setFavorites(List<Favorites> favorites) {
        this.favorites = favorites;
    }

    public List<Predictions> getPredictions() {
        return predictions;
    }

    public void setPredictions(List<Predictions> predictions) {
        this.predictions = predictions;
    }

    public List<Reviews> getReviews() {
        return reviews;
    }

    public void setReviews(List<Reviews> reviews) {
        this.reviews = reviews;
    }

    public List<Reports> getReports() {
        return reports;
    }

    public void setReports(List<Reports> reports) {
        this.reports = reports;
    }

    public List<Messages> getMessages() {
        return messages;
    }

    public void setMessages(List<Messages> messages) {
        this.messages = messages;
    }

    public List<Notifications> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notifications> notifications) {
        this.notifications = notifications;
    }

    public List<Itineraries> getItineraries() {
        return itineraries;
    }

    public void setItineraries(List<Itineraries> itineraries) {
        this.itineraries = itineraries;
    }
}
