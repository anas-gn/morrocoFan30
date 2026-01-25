package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Supporters")
public class Supporter {

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

    @Column(name = "totalPoints", columnDefinition = "INT DEFAULT 0")
    private Integer totalPoints;

    @Column(name = "imageUrl", length = 255)
    private String imageUrl;

    
    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorite> favorites;

    
    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Prediction> predictions;

    
    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews;

    
    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> reports;

    
    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages;

    
    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications;

    
    @OneToMany(mappedBy = "supporter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Itinerary> itineraries;

    // Getters et Setters
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

    public Integer getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    
    public List<Favorite> getFavorites() {
        return favorites;
    }

    public void setFavorites(List<Favorite> favorites) {
        this.favorites = favorites;
    }

    public List<Prediction> getPredictions() {
        return predictions;
    }

    public void setPredictions(List<Prediction> predictions) {
        this.predictions = predictions;
    }

    public List<Review> getReviews() {
        return reviews;
    }

    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }

    public List<Report> getReports() {
        return reports;
    }

    public void setReports(List<Report> reports) {
        this.reports = reports;
    }

    public List<Message> getMessages() {
        return messages;
    }

    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }

    public List<Itinerary> getItineraries() {
        return itineraries;
    }

    public void setItineraries(List<Itinerary> itineraries) {
        this.itineraries = itineraries;
    }
}
