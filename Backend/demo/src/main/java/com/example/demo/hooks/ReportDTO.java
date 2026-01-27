package com.example.demo.hooks;

import java.time.LocalDateTime;

public class ReportDTO {

    private int id;
    private LocalDateTime dateOfReport;
    private String description;
    private boolean badOrGood;
    private String imageUrl;
    private int supporterId;

    public ReportDTO() {
    }

    public ReportDTO(LocalDateTime dateOfReport, String description, boolean badOrGood, String imageUrl, int supporterId) {
        this.dateOfReport = dateOfReport;
        this.description = description;
        this.badOrGood = badOrGood;
        this.imageUrl = imageUrl;
        this.supporterId = supporterId;
    }

    public ReportDTO(int id, LocalDateTime dateOfReport, String description, boolean badOrGood, String imageUrl, int supporterId) {
        this.id = id;
        this.dateOfReport = dateOfReport;
        this.description = description;
        this.badOrGood = badOrGood;
        this.imageUrl = imageUrl;
        this.supporterId = supporterId;
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

    public int getSupporterId() {
        return supporterId;
    }

    public void setSupporterId(int supporterId) {
        this.supporterId = supporterId;
    }
}