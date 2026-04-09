package com.example.demo.controllers;

import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.TeamRepository;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.hooks.PlayerDTO;
import com.example.demo.models.Players;
import com.example.demo.models.Teams;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {
    RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
    RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.PATCH
})
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private TeamRepository teamRepository;

    public PlayerController(PlayerRepository p, TeamRepository t) {
        this.playerRepository = p;
        this.teamRepository = t;
    }

    // GET - Tous les joueurs
    @GetMapping("/players/all")
    public List<PlayerDTO> getAllPlayers() {
        List<Players> p = playerRepository.findAll();
        List<PlayerDTO> players = p.stream().map(this::convertPlayerToDTO).collect(Collectors.toList());
        if (players == null) {
            return null;
        } else {
            return players;
        }
    }

    // GET - Joueur par ID
    @GetMapping("/players/{id}")
    public PlayerDTO getPlayer(@PathVariable int id) {
        Players p = playerRepository.findById(id);
        if (p == null) {
            return null;
        } else {
            return convertPlayerToDTO(p);
        }
    }

    // GET - Joueurs par équipe
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<PlayerDTO>> getPlayersByTeam(@PathVariable int teamId) {
        List<Players> players = playerRepository.findByTeamId(teamId);
        List<PlayerDTO> playerDTOs = players.stream()
                .map(this::convertPlayerToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(playerDTOs);
    }

    // GET - Chercher joueur par nom
    @GetMapping("/search/name/{name}")
    public ResponseEntity<List<PlayerDTO>> searchPlayersByName(@PathVariable String name) {
        List<Players> players = playerRepository.findByNameContainingIgnoreCase(name);
        List<PlayerDTO> playerDTOs = players.stream()
                .map(this::convertPlayerToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(playerDTOs);
    }

    // GET - Top buteurs
    @GetMapping("/top/scorers")
    public ResponseEntity<List<PlayerDTO>> getTopScorers(
            @RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Players> players = playerRepository.findByOrderByGoalsDesc(pageable);
        List<PlayerDTO> playerDTOs = players.stream()
                .map(this::convertPlayerToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(playerDTOs);
    }

    // GET - Nombre total de joueurs
    @GetMapping("/count")
    public ResponseEntity<Long> getPlayersCount() {
        long count = playerRepository.count();
        return ResponseEntity.ok(count);
    }

    // GET - Nombre de joueurs par équipe
    @GetMapping("/count/byTeam")
    public ResponseEntity<Map<String, Long>> getPlayersCountByTeam() {
        List<Players> players = playerRepository.findAll();
        Map<String, Long> countByTeam = players.stream()
                .filter(p -> p.getTeam() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getTeam().getName(),
                        Collectors.counting()));
        return ResponseEntity.ok(countByTeam);
    }

    // GET - Statistiques des joueurs
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPlayersStats() {
        List<Players> players = playerRepository.findAll();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPlayers", players.size());
        stats.put("totalGoals", players.stream().mapToInt(Players::getGoals).sum());
        stats.put("averageAge", players.stream().mapToInt(Players::getAge).average().orElse(0));
        stats.put("averageHeight", players.stream().mapToDouble(Players::getHeight).average().orElse(0));
        stats.put("averageWeight", players.stream().mapToDouble(Players::getWeight).average().orElse(0));

        return ResponseEntity.ok(stats);
    }

    // GET - Joueurs sans buts
    @GetMapping("/noGoals")
    public ResponseEntity<List<PlayerDTO>> getPlayersWithNoGoals() {
        List<Players> players = playerRepository.findByGoals(0);
        List<PlayerDTO> playerDTOs = players.stream()
                .map(this::convertPlayerToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(playerDTOs);
    }

    // DELETE - Supprimer un joueur
    @DeleteMapping("/players/{id}")
    public boolean DeletePlayer(@PathVariable int id) {
        Players p = playerRepository.findById(id);
        if (p == null) {
            return false;
        } else {
            playerRepository.delete(p);
            return true;
        }
    }

    // DELETE - Supprimer tous les joueurs
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllPlayers() {
        playerRepository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    // POST - Ajouter un joueur
    @PostMapping("players/add")
    public ResponseEntity<?> addPlayer(@RequestBody PlayerDTO dto) {
        System.out.println("=== DTO reçu ===");
        System.out.println("name: " + dto.getName());
        System.out.println("teamId: " + dto.getTeamId());
        System.out.println("age: " + dto.getAge());
        System.out.println("urlImage: " + dto.getUrlImage());

        try {
            Teams team = teamRepository.findById(dto.getTeamId()).orElse(null);
            System.out.println("team trouvée: " + team);

            if (team == null) {
                return ResponseEntity.badRequest().body("Team not found with id: " + dto.getTeamId());
            }

            Players p = new Players();
            p.setName(dto.getName());
            p.setAge(dto.getAge());
            p.setGoals(dto.getGoals());
            p.setHeight(dto.getHeight());
            p.setWeight(dto.getWeight());
            p.setImgUrl(dto.getUrlImage());
            p.setTeam(team);

            playerRepository.save(p);
            return ResponseEntity.ok("Player created");

        } catch (Exception e) {
            e.printStackTrace(); // <-- affiche l'erreur complète dans le terminal
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    // PUT - Mettre à jour un joueur
    @PutMapping("/update/{id}")
    public boolean updatePlayer(@PathVariable int id, @RequestBody Players pp) {
        Players p = playerRepository.findById(id);
        if (p == null) {
            return false;
        } else {
            p.setGoals(pp.getGoals());
            p.setHeight(pp.getHeight());
            p.setWeight(pp.getWeight());
            p.setName(pp.getName());
            p.setAge(pp.getAge());
            p.setTeam(pp.getTeam());
            playerRepository.save(p);
            return true;
        }
    }

    // PATCH - Mise à jour partielle
    @PatchMapping("/{id}")
    public ResponseEntity<PlayerDTO> patchPlayer(
            @PathVariable int id,
            @RequestBody Players player) {
        Players existing = playerRepository.findById(id);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        if (player.getName() != null) {
            existing.setName(player.getName());
        }
        if (player.getAge() > 0) {
            existing.setAge(player.getAge());
        }
        if (player.getHeight() > 0) {
            existing.setHeight(player.getHeight());
        }
        if (player.getWeight() > 0) {
            existing.setWeight(player.getWeight());
        }
        if (player.getGoals() > 0) {
            existing.setGoals(player.getGoals());
        }
        if (player.getTeam() != null) {
            existing.setTeam(player.getTeam());
        }

        Players updated = playerRepository.save(existing);
        return ResponseEntity.ok(convertPlayerToDTO(updated));
    }

    // PUT - Ajouter un but
    @PutMapping("/addgoal/{id}")
    public boolean addGoal(@PathVariable int id) {
        Players p = playerRepository.findById(id);
        if (p == null) {
            return false;
        } else {
            p.setGoals(p.getGoals() + 1);
            playerRepository.save(p);
            return true;
        }
    }

    // PUT - Retirer un but
    @PutMapping("/removegoal/{id}")
    public ResponseEntity<PlayerDTO> removeGoal(@PathVariable int id) {
        Players p = playerRepository.findById(id);
        if (p == null) {
            return ResponseEntity.notFound().build();
        }

        if (p.getGoals() > 0) {
            p.setGoals(p.getGoals() - 1);
            playerRepository.save(p);
            return ResponseEntity.ok(convertPlayerToDTO(p));
        }

        return ResponseEntity.badRequest().build();
    }

    // PUT - Changer d'équipe
    @PutMapping("/{playerId}/transfer/{teamId}")
    public ResponseEntity<PlayerDTO> transferPlayer(
            @PathVariable int playerId,
            @PathVariable int teamId) {
        Players player = playerRepository.findById(playerId);
        Teams team = teamRepository.findById(teamId).orElse(null);

        if (player == null || team == null) {
            return ResponseEntity.notFound().build();
        }

        player.setTeam(team);
        playerRepository.save(player);
        return ResponseEntity.ok(convertPlayerToDTO(player));
    }

    // Conversion DTO
    private PlayerDTO convertPlayerToDTO(Players player) {
        PlayerDTO dto = new PlayerDTO();
        dto.setId(player.getId());
        dto.setGoals(player.getGoals());
        dto.setHeight(player.getHeight());
        dto.setWeight(player.getWeight());
        dto.setName(player.getName());
        dto.setAge(player.getAge());
        dto.setUrlImage(player.getImgUrl());

        if (player.getTeam() != null) {
            dto.setTeam(player.getTeam().getName());
            dto.setTeamId(player.getTeam().getId());
        } else {
            dto.setTeam("No Team");
            dto.setTeamId(0);
        }

        return dto;
    }
}