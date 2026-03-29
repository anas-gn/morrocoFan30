package com.example.demo.models;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "groups")
public class Groups {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<GroupTeam> groupTeams = new ArrayList<>();

    public Groups() {
    }

    public int getId() {
        return id;
    }

    public Groups(String name, List<GroupTeam> groupTeams) {
        this.name = name;
        this.groupTeams = groupTeams;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<GroupTeam> getGroupTeams() {
        return groupTeams;
    }

    public void setGroupTeams(List<GroupTeam> groupTeams) {
        this.groupTeams = groupTeams;
    }
}