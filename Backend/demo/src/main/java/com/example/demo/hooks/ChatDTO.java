package com.example.demo.hooks;

import java.time.LocalDateTime;

public class ChatDTO {
    private Integer id;
    private String content;
    private String country;
    private LocalDateTime dateOfSend;
    private Integer supporterId;

    // Constructors
    public ChatDTO() {
    }

    public ChatDTO(Integer id, String content, String country, LocalDateTime dateOfSend, Integer supporterId) {
        this.id = id;
        this.content = content;
        this.country = country;
        this.dateOfSend = dateOfSend;
        this.supporterId = supporterId;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public LocalDateTime getDateOfSend() {
        return dateOfSend;
    }

    public void setDateOfSend(LocalDateTime dateOfSend) {
        this.dateOfSend = dateOfSend;
    }

    public Integer getSupporterId() {
        return supporterId;
    }

    public void setSupporterId(Integer supporterId) {
        this.supporterId = supporterId;
    }
}
