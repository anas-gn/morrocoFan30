package com.example.demo.hooks;

import java.util.List;

public class GroupDTO {

    private int id;
    private String name;
    private List<GroupTeamDTO> groupTeams;

    public GroupDTO(String namee) {
        this.name = namee;
        this.groupTeams = null;
    }

    public GroupDTO(String name, List<GroupTeamDTO> groupTeams) {
        this.name = name;
        this.groupTeams = groupTeams;
    }

    public GroupDTO() {
    }

    public GroupDTO(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public int getId() {
        return id;
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

    public List<GroupTeamDTO> getGroupTeams() {
        return groupTeams;
    }

    public void setGroupTeams(List<GroupTeamDTO> groupTeams) {
        this.groupTeams = groupTeams;
    }
}