package com.example.demo.models;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.*;

@Entity
@Table(name = "player")

public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String team;
    private double height;
    private double weight;
    private int goals;

    @ManyToOne
    @JoinColumn(name = "teamID")
    private Team t;

    public Player(String name, String team, double height, double weight, int goals, Team t) {
        this.name = name;
        this.team = team;
        this.height = height;
        this.weight = weight;
        this.goals = goals;
        this.t = t;
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

    public Team getT() {
        return t;
    }

    public void setT(Team t) {
        this.t = t;
    }

}