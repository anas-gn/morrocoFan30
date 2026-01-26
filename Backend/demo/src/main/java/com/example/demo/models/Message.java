package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 100)
    private String country;

    @Column(name = "dateOfSend")
    private LocalDateTime dateOfSend;

    @ManyToOne
    @JoinColumn(name = "supporterID", nullable = false)
    private Supporter supporter;

    
    public Message() {}

    
    public Message(String content, String country, LocalDateTime dateOfSend, Supporter supporter) {
        this.content = content;
        this.country = country;
        this.dateOfSend = dateOfSend;
        this.supporter = supporter;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public LocalDateTime getDateOfSend() { return dateOfSend; }
    public void setDateOfSend(LocalDateTime dateOfSend) { this.dateOfSend = dateOfSend; }
    public Supporter getSupporter() { return supporter; }
    public void setSupporter(Supporter supporter) { this.supporter = supporter; }
}
