
package com.example.demo.hooks;

public class MatchTeamDTO {
    private int id;
    private int matchId;
    private int goals;
    private int teamId;
    private double position;
    private String teamName;
    private String imageUrl;

    public MatchTeamDTO() {
    }

    public MatchTeamDTO(int goals,int teamId,int matchId,String n,double position) {
        this.goals = goals;
        this.teamId=teamId;
        this.matchId=matchId;
        this.teamName=n;
        this.position=position;
       }

    public int getMatchId() {
        return matchId;
    }

    public void setMatchId(int matchId) {
        this.matchId = matchId;
    }

    public int getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }

    public int getGoals() {
        return goals;
    }

    public void setGoals(int goals) {
        this.goals = goals;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public double getPosition() {
        return position;
    }

    public void setPosition(double position) {
        this.position = position;
    }

}
