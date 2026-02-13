package com.example.demo.controllers;

import com.example.demo.hooks.FavoriteDTO;
import com.example.demo.models.Favorites;
import com.example.demo.models.Supporters;
import com.example.demo.models.Teams;
import com.example.demo.models.Matches;
import com.example.demo.models.MatchTeam;
import com.example.demo.repositories.FavoriteRepository;
import com.example.demo.repositories.SupporterRepository;
import com.example.demo.repositories.TeamRepository;
import com.example.demo.repositories.MatchRepository;
import com.example.demo.repositories.MatchTeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private SupporterRepository supportersRepository;

    @Autowired
    private TeamRepository teamsRepository;

    @Autowired
    private MatchRepository matchesRepository;

    @Autowired
    private MatchTeamRepository matchTeamRepository;

    // Ajouter un favori (retourne un DTO)
    @PostMapping("/add")
    public FavoriteDTO addFavorite(
            @RequestParam int supporterId,
            @RequestParam int ownerId,
            @RequestParam String type) {
        // Vérifier si le supporter existe
        Supporters supporter = supportersRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supporter introuvable");
        }

        // Vérifier si le favori existe déjà
        Optional<Favorites> existingFavorite = favoriteRepository
            .findBySupporterAndTypeAndOwnerID(supporter, type, ownerId);
        
        if (existingFavorite.isPresent()) {
            // Le favori existe déjà, retourner le favori existant
            return convertToDTO(existingFavorite.get());
        }

        // Créer et sauvegarder le favori
        Favorites favorite = new Favorites(LocalDateTime.now(), type, ownerId, supporter);
        favoriteRepository.save(favorite);

        // Si le type est "Team", ajouter automatiquement les matchs de cette équipe aux
        // favoris
        if ("Team".equalsIgnoreCase(type)) {
            addTeamMatchesToFavorites(supporter, ownerId);
        }

        return convertToDTO(favorite);
    }

    // Récupérer tous les favoris d'un supporter (retourne une liste de DTO)
    @GetMapping("/{supporterId}")
    public List<FavoriteDTO> getFavoritesBySupporter(@PathVariable int supporterId) {
        Supporters supporter = supportersRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supporter introuvable");
        }
        List<Favorites> favorites = favoriteRepository.findBySupporter(supporter);
        return favorites.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Récupérer les favoris d'un supporter par type (retourne une liste de DTO)
    @GetMapping("/{supporterId}/type/{type}")
    public List<FavoriteDTO> getFavoritesBySupporterAndType(
            @PathVariable int supporterId,
            @PathVariable String type) {
        Supporters supporter = supportersRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supporter introuvable");
        }
        List<Favorites> favorites = favoriteRepository.findBySupporterAndType(supporter, type);
        return favorites.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Vérifier si un favori existe déjà - VERSION CORRIGÉE
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkFavorite(
            @RequestParam int supporterId,
            @RequestParam int ownerId,
            @RequestParam String type) {
        Supporters supporter = supportersRepository.findById(supporterId);
        if (supporter == null) {
            return ResponseEntity.ok(false);
        }

        // Utiliser la méthode du repository pour vérifier directement
        boolean exists = favoriteRepository.existsBySupporterAndTypeAndOwnerID(supporter, type, ownerId);
        
        return ResponseEntity.ok(exists);
    }

    // Supprimer un favori - VERSION AMÉLIORÉE
    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<Void> deleteFavorite(@PathVariable int favoriteId) {
        if (!favoriteRepository.existsById(favoriteId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Favori introuvable");
        }
        favoriteRepository.deleteById(favoriteId);
        return ResponseEntity.noContent().build();
    }

    // Nouvelle méthode pour supprimer par critères
    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeFavorite(
            @RequestParam int supporterId,
            @RequestParam int ownerId,
            @RequestParam String type) {
        Supporters supporter = supportersRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supporter introuvable");
        }

        Optional<Favorites> favorite = favoriteRepository
            .findBySupporterAndTypeAndOwnerID(supporter, type, ownerId);
        
        if (favorite.isPresent()) {
            favoriteRepository.delete(favorite.get());
            return ResponseEntity.noContent().build();
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Favori introuvable");
        }
    }

    // Méthode privée pour ajouter automatiquement les matchs d'une équipe aux favoris
    private void addTeamMatchesToFavorites(Supporters supporter, int teamId) {
        // Récupérer tous les matchs de l'équipe
        List<MatchTeam> matchTeams = matchTeamRepository.findByTeamId(teamId);

        for (MatchTeam matchTeam : matchTeams) {
            Matches match = matchTeam.getMatch();

            // Vérifier si le match n'est pas déjà dans les favoris du supporter
            boolean alreadyFavorite = favoriteRepository
                .existsBySupporterAndTypeAndOwnerID(supporter, "Match", match.getId());

            if (!alreadyFavorite) {
                // Ajouter le match aux favoris
                Favorites matchFavorite = new Favorites(LocalDateTime.now(), "Match", match.getId(), supporter);
                favoriteRepository.save(matchFavorite);
            }
        }
    }

    // Méthode utilitaire pour convertir une entité Favorites en DTO
    private FavoriteDTO convertToDTO(Favorites favorite) {
        FavoriteDTO dto = new FavoriteDTO();
        dto.setId(favorite.getId());
        dto.setDateOfAdd(favorite.getDateOfAdd());
        dto.setType(favorite.getType());
        dto.setOwnerId(favorite.getOwnerID());
        dto.setSupporterId(favorite.getSupporter().getId());
        dto.setSupporterName(favorite.getSupporter().getName());
        return dto;
    }
}