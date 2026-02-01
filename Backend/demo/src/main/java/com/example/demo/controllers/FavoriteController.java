package com.example.demo.controllers;

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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

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

    // Ajouter un favori
    @PostMapping("/add")
    public Favorites addFavorite(
            @RequestParam int supporterId,
            @RequestParam int ownerId,
            @RequestParam String type) {
        // Vérifier si le supporter existe
        Supporters supporter = supportersRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supporter introuvable");
        }

        // Créer et sauvegarder le favori
        Favorites favorite = new Favorites(LocalDateTime.now(), type, ownerId, supporter);
        favoriteRepository.save(favorite);

        // Si le type est "Team", ajouter automatiquement les matchs de cette équipe aux favoris
        if ("Team".equalsIgnoreCase(type)) {
            addTeamMatchesToFavorites(supporter, ownerId);
        }

        return favorite;
    }

    // Récupérer tous les favoris d'un supporter
    @GetMapping("/{supporterId}")
    public List<Favorites> getFavoritesBySupporter(@PathVariable int supporterId) {
        Supporters supporter = supportersRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supporter introuvable");
        }
        return favoriteRepository.findBySupporter(supporter);
    }

    // Récupérer les favoris d'un supporter par type
    @GetMapping("/{supporterId}/type/{type}")
    public List<Favorites> getFavoritesBySupporterAndType(
            @PathVariable int supporterId,
            @PathVariable String type) {
        Supporters supporter = supportersRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supporter introuvable");
        }
        return favoriteRepository.findBySupporterAndType(supporter, type);
    }

    // Supprimer un favori
    @DeleteMapping("/{favoriteId}")
    public void deleteFavorite(@PathVariable int favoriteId) {
        if (!favoriteRepository.existsById(favoriteId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Favori introuvable");
        }
        favoriteRepository.deleteById(favoriteId);
    }

    // Méthode privée pour ajouter automatiquement les matchs d'une équipe aux favoris
    private void addTeamMatchesToFavorites(Supporters supporter, int teamId) {
        // Récupérer tous les matchs de l'équipe
        List<MatchTeam> matchTeams = matchTeamRepository.findByTeamId(teamId);

        for (MatchTeam matchTeam : matchTeams) {
            Matches match = matchTeam.getMatch();

            // Vérifier si le match n'est pas déjà dans les favoris du supporter
            boolean alreadyFavorite = favoriteRepository.findByTypeAndOwnerID("Match", match.getId())
                    .stream()
                    .anyMatch(fav -> fav.getSupporter().getId() == supporter.getId());

            if (!alreadyFavorite) {
                // Ajouter le match aux favoris
                Favorites matchFavorite = new Favorites(LocalDateTime.now(), "Match", match.getId(), supporter);
                favoriteRepository.save(matchFavorite);
            }
        }
    }
}
