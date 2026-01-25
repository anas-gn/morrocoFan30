package com.example.demo.models;

import jakarta.persistence.*;

@Entity
@Table(name = "Trees")
public class Tree {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "type", length = 100)
    private String type;

    // Constructors
    public Tree() {
    }

    public Tree(Integer id, String type) {
        this.id = id;
        this.type = type;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
