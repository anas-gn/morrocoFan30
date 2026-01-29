package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Matches")
public class Matches {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "DateOfMatch")
    private LocalDateTime dateOfMatch;

    private String referee;
    
    private int treeID;

    @Column(name = "status")
    private String status;

    private String type;

    @ManyToOne
    @JoinColumn(name = "stadeID")
    private Stades stade;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Predictions> predictions;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reports> reports;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL)
    private List<Reviews> reviews;

    public Matches() {
    }

    public Matches(LocalDateTime dateOfMatch, String referee, String status, String type, Stades stade, int treeID) {
        this.dateOfMatch = dateOfMatch;
        this.referee = referee;
        this.status = status;
        this.type = type;
        this.stade = stade;
        this.treeID = treeID;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDateTime getDateOfMatch() {
        return dateOfMatch;
    }

    public void setDateOfMatch(LocalDateTime dateOfMatch) {
        this.dateOfMatch = dateOfMatch;
    }

    public String getReferee() {
        return referee;
    }

    public void setReferee(String referee) {
        this.referee = referee;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Stades getStade() {
        return stade;
    }

    public void setStade(Stades stade) {
        this.stade = stade;
    }

    public int getTreeID() {
        return treeID;
    }

    public void setTreeID(int treeID) {
        this.treeID = treeID;
    }

    public List<Predictions> getPredictions() {
        return predictions;
    }

    public void setPredictions(List<Predictions> predictions) {
        this.predictions = predictions;
    }

    public List<Reports> getReports() {
        return reports;
    }

    public void setReports(List<Reports> reports) {
        this.reports = reports;
    }

}


