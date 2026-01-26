package com.example.demo.hooks;

import java.time.LocalDateTime;

public class MessageDTO {

    private Long id;
    private String content;
    private String country;
    private LocalDateTime dateOfSend;
    private Long supporterId; 

    
    public MessageDTO() {}

    
    public MessageDTO(Long id, String content, String country,
                      LocalDateTime dateOfSend, Long supporterId) {
        this.id = id;
        this.content = content;
        this.country = country;
        this.dateOfSend = dateOfSend;
        this.supporterId = supporterId;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public LocalDateTime getDateOfSend() { return dateOfSend; }
    public void setDateOfSend(LocalDateTime dateOfSend) { this.dateOfSend = dateOfSend; }

    public Long getSupporterId() { return supporterId; }
    public void setSupporterId(Long supporterId) { this.supporterId = supporterId; }
}
