package com.example.demo.hooks;

import java.time.LocalDateTime;

public class NotificationDTO {

    private int id;
    private LocalDateTime dateOfSend;
    private String content;
    private Boolean isRead;
    private int supporterId;
    private String supportName;

    public NotificationDTO() {
    }

    public NotificationDTO(int id, LocalDateTime dateOfSend, String content,
            Boolean isRead, int supporterId, String name) {
        this.id = id;
        this.dateOfSend = dateOfSend;
        this.content = content;
        this.isRead = isRead;
        this.supporterId = supporterId;
        this.supportName = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDateTime getDateOfSend() {
        return dateOfSend;
    }

    public void setDateOfSend(LocalDateTime dateOfSend) {
        this.dateOfSend = dateOfSend;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public int getSupporterId() {
        return supporterId;
    }

    public void setSupporterId(int supporterId) {
        this.supporterId = supporterId;
    }

    public String getSupportName() {
        return supportName;
    }

    public void setSupportName(String supportName) {
        this.supportName = supportName;
    }
}
