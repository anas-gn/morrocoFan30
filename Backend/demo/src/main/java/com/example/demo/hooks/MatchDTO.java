package com.example.demo.hooks;

import java.time.LocalDateTime;
import java.util.List;

public class MatchDTO {
    private int id;
    private LocalDateTime dateOfMatch;
    private String referee;
    private String statut;
    private String type;
    private int stadeId;
    private Integer treeId;
    private List<MatchTeamDTO> mt;
    private String stadeName;
    private String imageUrl;
    private List<MatchEventsDTO> matchEvents;
    private List<MatchPlayerDTO> matchPlayers;

    public MatchDTO() {
    }

    public MatchDTO(LocalDateTime dateOfMatch, String referee, String statut, String type, int stadeId, Integer treeId,
            String name, List<MatchTeamDTO> mt) {
        this.dateOfMatch = dateOfMatch;
        this.referee = referee;
        this.statut = statut;
        this.type = type;
        this.stadeId = stadeId;
        this.treeId = treeId;
        this.stadeName = name;
        this.mt = mt;
    }

    public List<MatchTeamDTO> getMatchTeams() {
        return mt;
    }

    public List<MatchTeamDTO> getMt() {
        return mt;
    }

    public void setMt(List<MatchTeamDTO> mt) {
        this.mt = mt;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setMatchTeams(List<MatchTeamDTO> teams) {
        this.mt = teams;
    }

    public String getStadeName() {
        return stadeName;
    }

    public void setStadeName(String stadeName) {
        this.stadeName = stadeName;
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

    public Integer getTreeId() {
        return treeId;
    }

    public void setTreeId(Integer treeId) {
        this.treeId = treeId;
    }

    public List<MatchEventsDTO> getMatchEvents() {
        return matchEvents;
    }

    public void setMatchEvents(List<MatchEventsDTO> matchEvents) {
        this.matchEvents = matchEvents;
    }

    public List<MatchPlayerDTO> getMatchPlayers() {
        return matchPlayers;
    }

    public void setMatchPlayers(List<MatchPlayerDTO> matchPlayers) {
        this.matchPlayers = matchPlayers;
    }
}