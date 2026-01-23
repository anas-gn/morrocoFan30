package com.example.demo.hooks;

import java.time.LocalDateTime;

public class MatchDTO {
    private int id;

    private LocalDateTime dateOfMatch;
    private String referee;
    private String statut;
    private String type;
    private int stadeId;

    public MatchDTO() {
    }

    public MatchDTO(LocalDateTime dateOfMatch, String referee, String statut, String type, int stadeId) {
        this.dateOfMatch = dateOfMatch;
        this.referee = referee;
        this.statut = statut;
        this.type = type;
        this.stadeId = stadeId;
    }

    public int getStadeId() {
        return stadeId;
    }

    public void setStadeId(int stadeId) {
        this.stadeId = stadeId;
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

}
