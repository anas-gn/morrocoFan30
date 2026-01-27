package com.example.demo.auth;

import com.example.demo.models.Supporter;

public class SessionManager {
    private static SessionManager instance;

    private String token;
    private int supporterId;
    private String name;
    private String email;
    private String phone;
    private String country;
    private Integer age;
    private Integer totalPoints;
    private Supporter currentSupporter;

    private SessionManager() {
        this.supporterId = -1;
    }

    public static SessionManager getInstance() {
        if (instance == null) {
            instance = new SessionManager();
        }
        return instance;
    }

    public void setUserSession(String token, String name, String email,
                               String phone, String country, Integer age, int supporterId) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.country = country;
        this.age = age;
        this.supporterId = supporterId;
    }

    public void setCurrentSupporter(Supporter supporter) {
        this.currentSupporter = supporter;
        if (supporter != null) {
            this.supporterId = supporter.getId();
            this.name = supporter.getName();
            this.email = supporter.getEmail();
            this.phone = supporter.getPhone();
            this.country = supporter.getCountry();
            this.age = supporter.getAge();
            this.totalPoints = supporter.getTotalPoints();
            System.out.println("Supporter actuel defini : ID=" + supporterId + ", Nom=" + name);
        }
    }

    public String getToken() {
        return token;
    }

    public int getSupporterId() {
        return supporterId;
    }

    public String getName() {
        return name != null ? name : "";
    }

    public String getEmail() {
        return email != null ? email : "";
    }

    public String getPhone() {
        return phone != null ? phone : "";
    }

    public String getCountry() {
        return country != null ? country : "";
    }

    public Integer getAge() {
        return age;
    }

    public Integer getTotalPoints() {
        return totalPoints != null ? totalPoints : 0;
    }

    public Supporter getCurrentSupporter() {
        return currentSupporter;
    }

    public boolean isLoggedIn() {
        return token != null && !token.isEmpty() && supporterId > 0;
    }

    public boolean hasSupporterSelected() {
        return supporterId > 0;
    }

    public void addPoints(int points) {
        if (totalPoints != null) {
            this.totalPoints = totalPoints + points;
        } else {
            this.totalPoints = points;
        }
        
        if (currentSupporter != null) {
            currentSupporter.setTotalPoints(this.totalPoints);
        }
        System.out.println("Points ajoutés : " + points + ", Points totaux : " + this.totalPoints);
    }

    public void updateTotalPoints(Integer points) {
        this.totalPoints = points;
        if (currentSupporter != null) {
            currentSupporter.setTotalPoints(points);
        }
    }

    public void logout() {
        this.token = null;
        this.name = null;
        this.email = null;
        this.phone = null;
        this.country = null;
        this.age = null;
        this.totalPoints = null;
        this.supporterId = -1;
        this.currentSupporter = null;
    }

    // DEBUG
    public void printSessionInfo() {
        System.out.println("SUPPORTER:");
        System.out.println("Token: " + (token != null ? "***" + token.substring(Math.max(0, token.length() - 4)) : "null"));
        System.out.println("Supporter ID: " + supporterId);
        System.out.println("Nom: " + getName());
        System.out.println("Email: " + getEmail());
        System.out.println("Telephone: " + getPhone());
        System.out.println("Pays: " + getCountry());
        System.out.println("Age: " + getAge());
        System.out.println();
        System.out.println("INFOS:");
        System.out.println("Logged in: " + isLoggedIn());
        System.out.println("Supporter selected: " + hasSupporterSelected());
        System.out.println("Points totaux: " + getTotalPoints());
    }

    public static void init() {
        if (instance == null) {
            instance = new SessionManager();
        }
    }
}