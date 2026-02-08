package com.example.demo.hooks;

public class MatchPlayerDTO {
    private int id;
    private int matchID;
    private int teamID;
    private int playerID;
    private boolean isStarter;
    private String position;
    private Integer jerseyNumber;
    private Integer minutesPlayed;
    private Double rating;
    
    // Optional: pour affichage
    private String playerName;
    private String playerImgUrl;

    public MatchPlayerDTO() {
    }

    public MatchPlayerDTO(int id, int matchID, int teamID, int playerID, boolean isStarter, String position) {
        this.id = id;
        this.matchID = matchID;
        this.teamID = teamID;
        this.playerID = playerID;
        this.isStarter = isStarter;
        this.position = position;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getMatchID() {
        return matchID;
    }

    public void setMatchID(int matchID) {
        this.matchID = matchID;
    }

    public int getTeamID() {
        return teamID;
    }

    public void setTeamID(int teamID) {
        this.teamID = teamID;
    }

    public int getPlayerID() {
        return playerID;
    }

    public void setPlayerID(int playerID) {
        this.playerID = playerID;
    }

    public boolean isStarter() {
        return isStarter;
    }

    public void setStarter(boolean starter) {
        isStarter = starter;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public Integer getJerseyNumber() {
        return jerseyNumber;
    }

    public void setJerseyNumber(Integer jerseyNumber) {
        this.jerseyNumber = jerseyNumber;
    }

    public Integer getMinutesPlayed() {
        return minutesPlayed;
    }

    public void setMinutesPlayed(Integer minutesPlayed) {
        this.minutesPlayed = minutesPlayed;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public String getPlayerImgUrl() {
        return playerImgUrl;
    }

    public void setPlayerImgUrl(String playerImgUrl) {
        this.playerImgUrl = playerImgUrl;
    }
}