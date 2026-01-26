package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Groups")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupTeam> groupTeams;

    public Group() {
    }

    public int getId() {
        return id;
    }

    public Group(String name, List<GroupTeam> groupTeams) {
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