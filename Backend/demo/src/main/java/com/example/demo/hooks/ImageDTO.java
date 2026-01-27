package com.example.demo.hooks;

public class ImageDTO {

    private int id;
    private String imageUrl;
    private String type;
    private int ownerID;

    public ImageDTO() {
    }

    public ImageDTO(String imageUrl, String type, int ownerID) {
        this.imageUrl = imageUrl;
        this.type = type;
        this.ownerID = ownerID;
    }

    public ImageDTO(int id, String imageUrl, String type, int ownerID) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.type = type;
        this.ownerID = ownerID;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getOwnerID() {
        return ownerID;
    }

    public void setOwnerID(int ownerID) {
        this.ownerID = ownerID;
    }
}