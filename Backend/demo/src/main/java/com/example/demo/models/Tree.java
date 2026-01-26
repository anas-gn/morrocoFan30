package com.example.demo.models;

import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "Trees")
public class Tree {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "type", length = 100)
    private String type;

    @OneToMany(mappedBy = "tree", cascade = CascadeType.ALL)
    private List<Match> matches;

    public Tree() {}

    public Tree(String type) {
        this.type = type;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Match> getMatches() {
        return this.matches;
    }

    public void setMatches(List<Match> matches) {
        this.matches = matches;
    }
}