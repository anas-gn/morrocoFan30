package com.example.demo.hooks;


public class PlayerDTO {

    private int id;
    private String name;
    private String team;
    private double height;
    private double weight;
    private int goals;
    private int teamId;

    public PlayerDTO() {
    }

    public PlayerDTO(String name, String team, double height, double weight, int goals,int teamm) {
        this.name = name;
        this.team = team;
        this.height = height;
        this.weight = weight;
        this.goals = goals;
        this.teamId=teamm;

    }

    public int getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
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
