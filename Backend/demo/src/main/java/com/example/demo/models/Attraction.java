package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Attraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String type;

    @ManyToOne
    @JoinColumn(name = "cityID")
    private CityHost cityHost;

    @OneToMany(mappedBy = "attraction", cascade = CascadeType.ALL)
    private List<Image> images;

    // ✅ Constructeurs
    public Attraction() {}

    public Attraction(String name, String description, String type) {
        this.name = name;
        this.description = description;
        this.type = type;
    }

    // ✅ Getters & Setters
    public Long getId() {
        return id;
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
 
    public String getType() {
        return type;
    }
 
    public void setType(String type) {
        this.type = type;
    }

    public CityHost getCityHost() {
        return cityHost;
    }

    public void setCityHost(CityHost cityHost) {
        this.cityHost = cityHost;
    }

    public List<Image> getImages() {
        return images;
    }
 
    public void setImages(List<Image> images) {
        this.images = images;
    }
}
