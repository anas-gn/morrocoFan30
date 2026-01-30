package com.example.demo.hooks;

import java.time.LocalDateTime;

public class MessageDTO {

    private int id;
    private String content;
    private String country;
    private LocalDateTime dateOfSend;
    private int supporterId;
    private String name;

    public MessageDTO() {
    }

    public MessageDTO(int id, String content, String country,
            LocalDateTime dateOfSend, int supporterId, String name) {
        this.id = id;
        this.name = name;
        this.content = content;
        this.country = country;
        this.dateOfSend = dateOfSend;
        this.supporterId = supporterId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public int getSupporterId() {
        return supporterId;
    }

    public void setSupporterId(int supporterId) {
        this.supporterId = supporterId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
