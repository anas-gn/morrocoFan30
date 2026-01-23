
package com.example.demo.hooks;

public class MatchTeamDTO {
    private int id;
    private int matchId;
    private int goals;
    private int teamId;

    public MatchTeamDTO() {
    }

    public MatchTeamDTO(int goals,int teamId,int matchId) {
        this.goals = goals;
        this.teamId=teamId;
        this.matchId=matchId;   }

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

}
