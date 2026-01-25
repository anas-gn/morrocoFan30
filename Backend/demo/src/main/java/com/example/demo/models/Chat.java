package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Messages")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "dateOfSend")
    private LocalDateTime dateOfSend;

    @ManyToOne
    @JoinColumn(name = "supporterID", referencedColumnName = "id")
    private Supporter supporter;

    // Constructors
    public Chat() {
    }

    public Chat(Integer id, String content, String country, LocalDateTime dateOfSend, Supporter supporter) {
        this.id = id;
        this.content = content;
        this.country = country;
        this.dateOfSend = dateOfSend;
        this.supporter = supporter;
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

    public Supporter getSupporter() {
        return supporter;
    }

    public void setSupporter(Supporter supporter) {
        this.supporter = supporter;
    }
}
