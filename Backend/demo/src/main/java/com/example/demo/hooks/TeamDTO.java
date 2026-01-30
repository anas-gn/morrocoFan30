package com.example.demo.hooks;



public class TeamDTO {

    private int id;
    private String country;
    private String name;
    private String imageUrl;
    private String coach;
    private String description;
    private int participation;

    public TeamDTO() {
    }

 


    public TeamDTO(String country, String name, String imageUrl, String coach, String description, int participation) {
        this.country = country;
        this.name = name;
        this.imageUrl = imageUrl;
        this.coach = coach;
        this.description = description;
        this.participation = participation;
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




    public int getParticipation() {
        return participation;
    }




    public void setParticipation(int participation) {
        this.participation = participation;
    }

}