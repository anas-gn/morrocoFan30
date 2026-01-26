package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private LocalDateTime dateOfReport;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "BOOLEAN")
    private boolean badOrGood;
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "supporterID", nullable = false)
    private Supporter supporter;

    public Report() {
    }

    public Report(LocalDateTime dateOfReport, String description, boolean badOrGood, String imageUrl,
            Supporter supporter) {
        this.dateOfReport = dateOfReport;
        this.description = description;
        this.badOrGood = badOrGood;
        this.imageUrl = imageUrl;
        this.supporter = supporter;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDateTime getDateOfReport() {
        return dateOfReport;
    }

    public void setDateOfReport(LocalDateTime dateOfReport) {
        this.dateOfReport = dateOfReport;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isBadOrGood() {
        return badOrGood;
    }

    public void setBadOrGood(boolean badOrGood) {
        this.badOrGood = badOrGood;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Supporter getSupporter() {
        return supporter;
    }

    public void setSupporter(Supporter supporter) {
        this.supporter = supporter;
    }
}