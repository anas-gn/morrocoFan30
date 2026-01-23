package com.example.demo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String country;
    private String name;
    private String imageUrl;
    private String coach;
    private String description;

    @OneToMany(mappedBy = "teams", cascade = CascadeType.ALL)
    private List<Match> matches;

    @OneToMany(mappedBy = "teams", cascade = CascadeType.ALL)
    private List<Player> players;

    @ManyToOne
    @JoinColumn(name = "groupeID")
    private Groupe gr;

    @OneToMany(mappedBy = "teams", cascade = CascadeType.ALL)
    private List<CulturelContent> cc;

    @OneToMany(mappedBy = "teams", cascade = CascadeType.ALL)
    private List<News> nw;

    public Team(String name, String imageUrl, String coach, String description, List<Match> m, List<Player> players,
            Groupe gr) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.matches = m;
        this.players = players;
        this.coach = coach;
        this.gr = gr;
        this.description = description;
    }

    public Groupe getGr() {
        return gr;
    }

    public void setGr(Groupe gr) {
        this.gr = gr;
    }

    public List<Match> getMatches() {
        return matches;
    }

    public void setMatches(List<Match> matches) {
        this.matches = matches;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCoach() {
        return coach;
    }

    public void setCoach(String coach) {
        this.coach = coach;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Player> getPlayers() {
        return players;
    }

    public void setPlayers(List<Player> players) {
        this.players = players;
    }

    public List<CulturelContent> getCc() {
        return cc;
    }

    public void setCc(List<CulturelContent> cc) {
        this.cc = cc;
    }

    public List<News> getNw() {
        return nw;
    }

    public void setNw(List<News> nw) {
        this.nw = nw;
    }

}