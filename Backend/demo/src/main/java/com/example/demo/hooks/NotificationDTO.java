package com.example.demo.hooks;

import java.time.LocalDateTime;

public class NotificationDTO {

    private int id;
    private LocalDateTime dateOfSend;
    private String content;
    private Boolean isRead;
    private int supporterId; 

    
    public NotificationDTO() {}

    
    public NotificationDTO(int id, LocalDateTime dateOfSend, String content,
                           Boolean isRead, int supporterId) {
        this.id = id;
        this.dateOfSend = dateOfSend;
        this.content = content;
        this.isRead = isRead;
        this.supporterId = supporterId;
    }

    
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public LocalDateTime getDateOfSend() { return dateOfSend; }
    public void setDateOfSend(LocalDateTime dateOfSend) { this.dateOfSend = dateOfSend; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public int getSupporterId() { return supporterId; }
    public void setSupporterId(int supporterId) { this.supporterId = supporterId; }
}
