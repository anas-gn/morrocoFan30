package com.example.demo.hooks;

public class PlayerDTO {
 
    private int id;
    private String name;
    private String team;
    private double height;
    private double weight;
    private int goals;
    private int age;
    private int teamId;
    private String teamName;
    private String urlImage;

    public PlayerDTO() {
    }

    public PlayerDTO(String name, String team, double height, double weight, int age, int goals, int teamm, String url,
            String n) {
        this.name = name;
        this.team = team;
        this.height = height;
        this.weight = weight;
        this.goals = goals;
        this.teamId = teamm;
        this.age = age;
        this.teamName = n;
        this.urlImage = url;
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

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getUrlImage() {
        return urlImage;
    }

    public void setUrlImage(String urlImage) {
        this.urlImage = urlImage;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

}
