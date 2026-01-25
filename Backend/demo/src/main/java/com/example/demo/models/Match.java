package com.example.demo.models;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private LocalDateTime dateOfMatch;
    private String referee;
    private String statut;
    private String type;
    private int treeId;

    @OneToMany(mappedBy = "matches", cascade = CascadeType.ALL)
    private List<Prediction> p;

    @OneToMany(mappedBy = "matches", cascade = CascadeType.ALL)
    private List<Report> report;

    @ManyToOne
    @JoinColumn(name = "stadeID")
    private Stade st;

    public Match(LocalDateTime dateOfMatch, String referee, String statut, String type, Stade st) {
        this.dateOfMatch = dateOfMatch;
        this.referee = referee;
        this.statut = statut;
        this.type = type;
        this.st = st;

    }

    public List<Prediction> getP() {
        return p;
    }

    public void setP(List<Prediction> p) {
        this.p = p;
    }

    public Stade getSt() {
        return st;
    }

    public void setSt(Stade st) {
        this.st = st;
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

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Prediction> getPrediction() {
        return p;
    }

    public void setPrediction(List<Prediction> p) {
        this.p = p;
    }

    public List<Report> getReport() {
        return report;
    }

    public void setReport(List<Report> report) {
        this.report = report;
    }

    public Stade getStade() {
        return st;
    }

    public void setStade(Stade st) {
        this.st = st;
    }

    public int getTreeId() {
        return treeId;
    }

    public void setTreeId(int treeId) {
        this.treeId = treeId;
    }

}