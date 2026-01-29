package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Notifications")
public class Notifications {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "dateOfSend")
    private LocalDateTime dateOfSend;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "isRead")
    private Boolean isRead;

    @ManyToOne
    @JoinColumn(name = "supporterID", nullable = false)
    private Supporters supporter;

    public Notifications() {
    }

    public Notifications(LocalDateTime dateOfSend, String content, Boolean isRead, Supporters supporter) {
        this.dateOfSend = dateOfSend;
        this.content = content;
        this.isRead = isRead;
        this.supporter = supporter;
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

    public Supporters getSupporter() {
        return supporter;
    }

    public void setSupporter(Supporters supporter) {
        this.supporter = supporter;
    }
}
