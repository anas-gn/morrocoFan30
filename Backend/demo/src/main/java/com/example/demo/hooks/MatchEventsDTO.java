package com.example.demo.hooks;

public class MatchEventsDTO {
    private int id;
    private int matchID;
    private int playerID;
    private int teamID;

    private Integer minute;
    private String additionalInfo;

    // Optional: pour affichage
    private String playerName;
    private String teamName;

    public MatchEventsDTO() {
    }

    public MatchEventsDTO(int id, int matchID, int playerID, int teamID, Integer minute, String additionalInfo) {
        this.id = id;
        this.matchID = matchID;
        this.playerID = playerID;
        this.teamID = teamID;
        this.minute = minute;
        this.additionalInfo = additionalInfo;
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

    public int getPlayerID() {
        return playerID;
    }

    public void setPlayerID(int playerID) {
        this.playerID = playerID;
    }

    public int getTeamID() {
        return teamID;
    }

    public void setTeamID(int teamID) {
        this.teamID = teamID;
    }

    public Integer getMinute() {
        return minute;
    }

    public void setMinute(Integer minute) {
        this.minute = minute;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
}