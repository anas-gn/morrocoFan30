package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "Players")

public class Players {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String imgUrl;
    private String name;
    private double height;
    private double weight;
    private int goals;
    private int age;

    @ManyToOne
    @JoinColumn(name = "teamID")
    private Teams team;

    public Players(String name, double height, double weight, int goals, int age, Teams team) {
        this.name = name;
        this.height = height;
        this.weight = weight;
        this.goals = goals;
        this.team = team;
        this.age = age;
    }

    public Players() {
    }

    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Teams getTeam() {
        return team;
    }

    public void setTeam(Teams team) {
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

}