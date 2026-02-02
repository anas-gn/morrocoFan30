package com.example.demo.hooks;

import java.time.LocalDateTime;
import java.util.List;

public class NewsDTO {

    private int id;
    private String title;
    private String author;
    private String description;
    private String detail;
    private String imageUrl;
    private LocalDateTime dateOfCreation;
    private int teamId;
    private String teamName;
    private List<String> images;
    // Constructors
    

    public NewsDTO(int id, String title, String author, String description, String detail, String imageUrl,
            LocalDateTime dateOfCreation, int teamId, String teamName, List<String> images) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.description = description;
        this.detail = detail;
        this.imageUrl = imageUrl;
        this.dateOfCreation = dateOfCreation;
        this.teamId = teamId;
        this.teamName = teamName;
        this.images = images;
    }

    public NewsDTO() {
    }

    public NewsDTO(String title, String author, String description, String detail, String imageUrl,
            LocalDateTime dateOfCreation, int teamId, String teamName) {

        this.title = title;
        this.author = author;
        this.description = description;
        this.detail = detail;
        this.imageUrl = imageUrl;
        this.dateOfCreation = dateOfCreation;
        this.teamId = teamId;
        this.teamName = teamName;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getDateOfCreation() {
        return dateOfCreation;
    }

    public void setDateOfCreation(LocalDateTime dateOfCreation) {
        this.dateOfCreation = dateOfCreation;
    }

    public int getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
    public List<String> getImages() {
        return images;
    }
    public void setImages(List<String> images) {
        this.images = images;
    }
}