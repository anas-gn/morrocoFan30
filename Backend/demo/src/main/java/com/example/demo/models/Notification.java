package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dateOfSend")
    private LocalDateTime dateOfSend;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "isRead", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isRead;

    @ManyToOne
    @JoinColumn(name = "supporterID", nullable = false)
    private Supporter supporter;

    
    public Notification() {}

    
    public Notification(LocalDateTime dateOfSend, String content, Boolean isRead, Supporter supporter) {
        this.dateOfSend = dateOfSend;
        this.content = content;
        this.isRead = isRead;
        this.supporter = supporter;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getDateOfSend() { return dateOfSend; }
    public void setDateOfSend(LocalDateTime dateOfSend) { this.dateOfSend = dateOfSend; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public Supporter getSupporter() { return supporter; }
    public void setSupporter(Supporter supporter) { this.supporter = supporter; }
}
