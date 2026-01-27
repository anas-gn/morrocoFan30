package com.example.demo.hooks;

public class GroupDTO {

    private int id;
    private String name;

    public GroupDTO() {
    }

    public GroupDTO(String name) {
        this.name = name;
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
}