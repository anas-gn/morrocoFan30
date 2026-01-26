package com.example.demo.hooks;

import java.time.LocalDateTime;

public class NotificationDTO {

    private Long id;
    private LocalDateTime dateOfSend;
    private String content;
    private Boolean isRead;
    private Long supporterId; 

    
    public NotificationDTO() {}

    
    public NotificationDTO(Long id, LocalDateTime dateOfSend, String content,
                           Boolean isRead, Long supporterId) {
        this.id = id;
        this.dateOfSend = dateOfSend;
        this.content = content;
        this.isRead = isRead;
        this.supporterId = supporterId;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDateOfSend() { return dateOfSend; }
    public void setDateOfSend(LocalDateTime dateOfSend) { this.dateOfSend = dateOfSend; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public Long getSupporterId() { return supporterId; }
    public void setSupporterId(Long supporterId) { this.supporterId = supporterId; }
}
