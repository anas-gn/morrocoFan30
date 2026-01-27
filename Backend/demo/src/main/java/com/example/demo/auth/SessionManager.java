package com.example.demo.auth;

import com.example.demo.models.Supporter;
import com.example.demo.models.Responsable;

public class SessionManager {
    private static SessionManager instance;

    private String token;
    private int userId;
    private String userType; // "SUPPORTER" ou "RESPONSABLE"
    private String name;
    private String email;
    private String phone;
    private String country;
    private Integer age;
    private String imageUrl;
    private Integer totalPoints; // Pour Supporter
    
    // Objets utilisateur
    private Supporter currentSupporter;
    private Responsable currentResponsable;

    private SessionManager() {
        this.userId = -1;
        this.userType = null;
    }

    public static SessionManager getInstance() {
        if (instance == null) {
            instance = new SessionManager();
        }
        return instance;
    }

    // ========== SETTER POUR SUPPORTER ==========
    
    public void setSupporterSession(String token, String name, String email,
                                    String phone, String country, Integer age, 
                                    Integer totalPoints, int supporterId) {
        this.token = token;
        this.userType = "SUPPORTER";
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.country = country;
        this.age = age;
        this.totalPoints = totalPoints;
        this.userId = supporterId;
        this.currentSupporter = null;
        this.currentResponsable = null;
        System.out.println("Session SUPPORTER etablie : ID=" + supporterId + ", Nom=" + name);
    }

    public void setCurrentSupporter(Supporter supporter) {
        this.currentSupporter = supporter;
        if (supporter != null) {
            this.userType = "SUPPORTER";
            this.userId = supporter.getId();
            this.name = supporter.getName();
            this.email = supporter.getEmail();
            this.phone = supporter.getPhone();
            this.country = supporter.getCountry();
            this.age = supporter.getAge();
            this.totalPoints = supporter.getTotalPoints();
            this.imageUrl = null;
            this.currentResponsable = null;
            System.out.println("Supporter actuel defini : ID=" + userId + ", Nom=" + name);
        }
    }

    // ========== SETTER POUR RESPONSABLE ==========
    
    public void setResponsableSession(String token, String name, String email,
                                      String phone, String country, Integer age, 
                                      String imageUrl, int responsableId) {
        this.token = token;
        this.userType = "RESPONSABLE";
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.country = country;
        this.age = age;
        this.imageUrl = imageUrl;
        this.userId = responsableId;
        this.totalPoints = null;
        this.currentResponsable = null;
        this.currentSupporter = null;
        System.out.println("Session RESPONSABLE etablie : ID=" + responsableId + ", Nom=" + name);
    }

    public void setCurrentResponsable(Responsable responsable) {
        this.currentResponsable = responsable;
        if (responsable != null) {
            this.userType = "RESPONSABLE";
            this.userId = responsable.getId();
            this.name = responsable.getName();
            this.email = responsable.getEmail();
            this.phone = responsable.getPhone();
            this.country = responsable.getCountry();
            this.age = responsable.getAge();
            this.imageUrl = responsable.getImageUrl();
            this.totalPoints = null;
            this.currentSupporter = null;
            System.out.println("Responsable actuel defini : ID=" + userId + ", Nom=" + name);
        }
    }

    // ========== GETTERS GENERIQUES ==========
    
    public String getToken() {
        return token;
    }

    public int getUserId() {
        return userId;
    }

    public String getUserType() {
        return userType;
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

    public String getImageUrl() {
        return imageUrl != null ? imageUrl : "";
    }

    // ========== GETTERS SPECIFIQUES SUPPORTER ==========
    
    public Integer getTotalPoints() {
        return totalPoints != null ? totalPoints : 0;
    }

    public Supporter getCurrentSupporter() {
        return currentSupporter;
    }

    // ========== GETTERS SPECIFIQUES RESPONSABLE ==========
    
    public Responsable getCurrentResponsable() {
        return currentResponsable;
    }

    // ========== VERIFICATIONS ==========
    
    public boolean isLoggedIn() {
        return token != null && !token.isEmpty() && userId > 0;
    }

    public boolean isSupporter() {
        return isLoggedIn() && "SUPPORTER".equals(userType);
    }

    public boolean isResponsable() {
        return isLoggedIn() && "RESPONSABLE".equals(userType);
    }

    public boolean hasUserSelected() {
        return userId > 0;
    }

    // ========== GESTION DES POINTS (SUPPORTER) ==========
    
    public void addPoints(int points) {
        if (!isSupporter()) {
            System.out.println("Erreur: Seul un SUPPORTER peut ajouter des points");
            return;
        }

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
        if (!isSupporter()) {
            System.out.println("Erreur: Seul un SUPPORTER peut avoir des points");
            return;
        }

        this.totalPoints = points;
        if (currentSupporter != null) {
            currentSupporter.setTotalPoints(points);
        }
        System.out.println("Points mis à jour : " + points);
    }

    // ========== MISE A JOUR PROFIL ==========
    
    public void updateProfile(String name, String email, String phone, String country, Integer age) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.country = country;
        this.age = age;

        if (currentSupporter != null) {
            currentSupporter.setName(name);
            currentSupporter.setEmail(email);
            currentSupporter.setPhone(phone);
            currentSupporter.setCountry(country);
            currentSupporter.setAge(age);
        }

        if (currentResponsable != null) {
            currentResponsable.setName(name);
            currentResponsable.setEmail(email);
            currentResponsable.setPhone(phone);
            currentResponsable.setCountry(country);
            currentResponsable.setAge(age);
        }

        System.out.println("Profil mis à jour");
    }

    public void updateImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        
        if (currentResponsable != null) {
            currentResponsable.setImageUrl(imageUrl);
        }
        
        System.out.println("Image mise à jour: " + imageUrl);
    }

    // ========== LOGOUT ==========
    
    public void logout() {
        System.out.println("Deconnexion de : " + getName() + " (" + userType + ")");
        this.token = null;
        this.userType = null;
        this.name = null;
        this.email = null;
        this.phone = null;
        this.country = null;
        this.age = null;
        this.imageUrl = null;
        this.totalPoints = null;
        this.userId = -1;
        this.currentSupporter = null;
        this.currentResponsable = null;
    }

    // ========== DEBUG ==========
    
    public void printSessionInfo() {
        System.out.println("\n╔════════════════════════════════════════╗");
        System.out.println("║          SESSION USER - INFO           ║");
        System.out.println("╚════════════════════════════════════════╝");
        
        if (!isLoggedIn()) {
            System.out.println("❌ Aucune session active");
            System.out.println("════════════════════════════════════════\n");
            return;
        }

        System.out.println("✅ SESSION ACTIVE");
        System.out.println("Type utilisateur: " + getUserType());
        System.out.println();
        System.out.println("TOKEN & INFOS:");
        System.out.println("Token: " + (token != null ? "***" + token.substring(Math.max(0, token.length() - 4)) : "null"));
        System.out.println("User ID: " + getUserId());
        System.out.println("Nom: " + getName());
        System.out.println("Email: " + getEmail());
        System.out.println("Telephone: " + getPhone());
        System.out.println("Pays: " + getCountry());
        System.out.println("Age: " + getAge());
        
        if (isSupporter()) {
            System.out.println();
            System.out.println("INFOS SUPPORTER:");
            System.out.println("Points totaux: " + getTotalPoints());
        }

        if (isResponsable()) {
            System.out.println();
            System.out.println("INFOS RESPONSABLE:");
            System.out.println("Image: " + getImageUrl());
        }

        System.out.println();
        System.out.println("STATUS:");
        System.out.println("Logged in: " + isLoggedIn());
        System.out.println("Is Supporter: " + isSupporter());
        System.out.println("Is Responsable: " + isResponsable());
        System.out.println("════════════════════════════════════════\n");
    }

    public static void init() {
        if (instance == null) {
            instance = new SessionManager();
        }
    }
}