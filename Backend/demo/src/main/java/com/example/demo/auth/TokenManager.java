package com.example.demo.auth;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;

public class TokenManager {
    
    private static final String TOKEN_FILE = System.getProperty("user.home") + "/.morocfan_token";
    private static final String SUPPORTER_ID_FILE = System.getProperty("user.home") + "/.morocfan_supporter_id";
    
    // ========== GESTION DU TOKEN ==========
    
    public static void saveToken(String token) {
        try {
            Files.write(Paths.get(TOKEN_FILE), token.getBytes());
            System.out.println("Token sauvegarde dans: " + TOKEN_FILE);
        } catch (IOException e) {
            System.err.println("Erreur sauvegarde token: " + e.getMessage());
        }
    }
    
    public static String loadToken() {
        try {
            if (Files.exists(Paths.get(TOKEN_FILE))) {
                String token = new String(Files.readAllBytes(Paths.get(TOKEN_FILE)));
                System.out.println("Token charge avec succes");
                return token;
            }
        } catch (IOException e) {
            System.err.println("Erreur chargement token: " + e.getMessage());
        }
        return null;
    }
    
    public static void deleteToken() {
        try {
            Files.deleteIfExists(Paths.get(TOKEN_FILE));
            System.out.println("Token supprime");
        } catch (IOException e) {
            System.err.println("Erreur suppression token: " + e.getMessage());
        }
    }
    
    public static boolean hasToken() {
        return Files.exists(Paths.get(TOKEN_FILE));
    }
    
    // ========== GESTION DE L'ID SUPPORTER ==========
    
    public static void saveSupporterId(int supporterId) {
        try {
            String id = String.valueOf(supporterId);
            Files.write(Paths.get(SUPPORTER_ID_FILE), id.getBytes());
            System.out.println("ID Supporter sauvegarde: " + supporterId);
        } catch (IOException e) {
            System.err.println("Erreur sauvegarde ID supporter: " + e.getMessage());
        }
    }
    
    public static int loadSupporterId() {
        try {
            if (Files.exists(Paths.get(SUPPORTER_ID_FILE))) {
                String id = new String(Files.readAllBytes(Paths.get(SUPPORTER_ID_FILE)));
                System.out.println("ID Supporter charge: " + id);
                return Integer.parseInt(id);
            }
        } catch (IOException | NumberFormatException e) {
            System.err.println("Erreur chargement ID supporter: " + e.getMessage());
        }
        return -1;
    }
    
    public static void deleteSupporterId() {
        try {
            Files.deleteIfExists(Paths.get(SUPPORTER_ID_FILE));
            System.out.println("ID Supporter supprime");
        } catch (IOException e) {
            System.err.println("Erreur suppression ID supporter: " + e.getMessage());
        }
    }
    
    // ========== VALIDATION DU TOKEN ==========
    
    public static boolean isTokenValid(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        
        try {
            // Vérifier le format JWT (3 parties séparées par des points)
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                System.out.println("Token invalide: format JWT incorrect");
                return false;
            }
            
            // Décoder et vérifier le payload
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            System.out.println("Token valide - Payload charge");
            return true;
            
        } catch (IllegalArgumentException e) {
            System.err.println("Erreur validation token: " + e.getMessage());
            return false;
        }
    }
    
    public static boolean isTokenExpired(String token) {
        if (!isTokenValid(token)) {
            return true;
        }
        
        try {
            String[] parts = token.split("\\.");
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            
            // Vérifier la présence de "exp" dans le payload
            if (payload.contains("exp")) {
                System.out.println("Token avec expiration detecte");
                // L'implémentation complète dépend de votre JWT library
                return false;
            }
            
            return false;
            
        } catch (Exception e) {
            System.err.println("Erreur verification expiration: " + e.getMessage());
            return true;
        }
    }
    
    // ========== NETTOYAGE ==========
    
    public static void clearAllTokenData() {
        try {
            deleteToken();
            deleteSupporterId();
            System.out.println("Toutes les donnees de token supprimees");
        } catch (Exception e) {
            System.err.println("Erreur nettoyage token data: " + e.getMessage());
        }
    }
    
    // ========== UTILITAIRES ==========
    
    public static boolean hasValidTokenData() {
        return hasToken() && loadSupporterId() > 0;
    }
    
    public static void printTokenInfo() {
        System.out.println("\n=== TOKEN INFO ===");
        System.out.println("Token existe: " + hasToken());
        
        String token = loadToken();
        if (token != null) {
            System.out.println("Token: ***" + token.substring(Math.max(0, token.length() - 4)));
            System.out.println("Token valide: " + isTokenValid(token));
            System.out.println("Token expire: " + isTokenExpired(token));
        }
        
        int supporterId = loadSupporterId();
        System.out.println("ID Supporter: " + supporterId);
        System.out.println("Donnees valides: " + hasValidTokenData());
        System.out.println("==================\n");
    }
}