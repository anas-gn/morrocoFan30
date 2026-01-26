package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "Images")
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imageUrl;
    private String type;
    private Long ownerID;

    public Image() {}

    public Image(String imageUrl, String type, Long ownerID) {
        this.imageUrl = imageUrl;
        this.type = type;
        this.ownerID = ownerID;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getOwnerID() { return ownerID; }
    public void setOwnerID(Long ownerID) { this.ownerID = ownerID; }
}
