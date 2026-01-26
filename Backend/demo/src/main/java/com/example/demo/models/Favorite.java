package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Favorites")
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dateOfAdd")
    private LocalDateTime dateOfAdd;

    @Column(length = 50)
    private String type;

    @Column(name = "ownerID")
    private Long ownerID;

    @ManyToOne
    @JoinColumn(name = "supporterID", nullable = false)
    private Supporter supporter;

    
    public Favorite() {}

    
    public Favorite(LocalDateTime dateOfAdd, String type, Long ownerID, Supporter supporter) {
        this.dateOfAdd = dateOfAdd;
        this.type = type;
        this.ownerID = ownerID;
        this.supporter = supporter;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getDateOfAdd() { return dateOfAdd; }
    public void setDateOfAdd(LocalDateTime dateOfAdd) { this.dateOfAdd = dateOfAdd; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getOwnerID() { return ownerID; }
    public void setOwnerID(Long ownerID) { this.ownerID = ownerID; }
    public Supporter getSupporter() { return supporter; }
    public void setSupporter(Supporter supporter) { this.supporter = supporter; }
}
