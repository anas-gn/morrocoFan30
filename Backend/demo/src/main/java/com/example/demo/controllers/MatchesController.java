package com.example.demo.controllers;

import com.example.demo.repositories.GroupTeamRepository;
import com.example.demo.repositories.MatchRepository;
import com.example.demo.repositories.StadeRepository;
import com.example.demo.repositories.MatchTeamRepository;
import com.example.demo.repositories.MatchEventsRepository;
import com.example.demo.repositories.MatchPlayerRepository;
import com.example.demo.repositories.PredictionRepository;
import com.example.demo.repositories.SupporterRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.NotificationRepository;
import com.example.demo.repositories.FavoriteRepository;
import com.example.demo.repositories.TeamRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.hooks.MatchDTO;
import com.example.demo.hooks.MatchTeamDTO;
import com.example.demo.hooks.MatchEventsDTO;
import com.example.demo.hooks.MatchPlayerDTO;
import com.example.demo.hooks.TeamDTO;
import com.example.demo.hooks.PlayerDTO;
import com.example.demo.models.Matches;
import com.example.demo.models.MatchEvents;
import com.example.demo.models.MatchPlayer;
import com.example.demo.models.Notifications;
import com.example.demo.models.Players;
import com.example.demo.models.Predictions;
import com.example.demo.models.Favorites;
import com.example.demo.models.GroupTeam;
import com.example.demo.models.Groups;
import com.example.demo.models.MatchTeam;
import com.example.demo.models.Stades;
import com.example.demo.models.Supporters;
import com.example.demo.models.Teams;

import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/matches")
public class MatchesController {
    @Autowired
    private StadeRepository StadeRepository;
    @Autowired
    private MatchRepository matchRepo;
    @Autowired
    private MatchTeamRepository MatchTeamRepository;
    @Autowired
    private MatchEventsRepository matchEventsRepository;
    @Autowired
    private MatchPlayerRepository matchPlayerRepository;
    @Autowired
    private PlayerController PlayerController;
    @Autowired
    private GroupTeamRepository groupTeamRepository;
    @Autowired
    private PredictionRepository predictionRepository;
    @Autowired
    private SupporterRepository supporterRepository;
    @Autowired
    private NotificationRepository notificationsRepo;
    @Autowired
    private FavoriteRepository favoritesRepo;
    @Autowired
    private PlayerRepository playerRepository;
    @Autowired
    private TeamRepository teamRepository;

    public MatchesController(MatchRepository m, StadeRepository st, MatchTeamRepository mm,
            MatchEventsRepository matchEventsRepository, MatchPlayerRepository matchPlayerRepository) {
        this.matchRepo = m;
        this.StadeRepository = st;
        this.MatchTeamRepository = mm;
        this.matchEventsRepository = matchEventsRepository;
        this.matchPlayerRepository = matchPlayerRepository;
    }

    // all matches in the competition
    @GetMapping("/matches/all")
    public List<MatchDTO> getUpcomingMatches() {
        return matchRepo.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /////// matches par date
    @GetMapping("/matches/allTriee")
    public List<MatchDTO> matchesTrieeParDate() {
        return matchRepo.findAll().stream()
                .map(this::convertToDTO)
                .sorted(Comparator.comparing(MatchDTO::getDateOfMatch).reversed())
                .collect(Collectors.toList());
    }

    @GetMapping("/matches/{id}/group")
    public GroupController.GroupDTO getGroupByMatchId(@PathVariable int id) {

        Matches match = matchRepo.findById(id);
        if (match == null)
            return null;
        if (!"Group stage".equalsIgnoreCase(match.getType())) {
            return null;
        }
        List<MatchTeam> matchTeams = MatchTeamRepository.findByMatchId(id);
        if (matchTeams == null || matchTeams.isEmpty())
            return null;
        Teams team = matchTeams.get(0).getTeam();
        List<GroupTeam> groupTeams = groupTeamRepository.findByTeamId(team.getId());
        if (groupTeams == null || groupTeams.isEmpty())
            return null;
        Groups group = groupTeams.get(0).getGroup();
        return new GroupController.GroupDTO(group);
    }

    // matches by groupe
    @GetMapping("/matches/groupe/{id}")
    public List<MatchDTO> getMatchesOfGroup(@PathVariable int id) {
        List<Matches> matches = matchRepo.findMatchesByGroupeId(id);
        return matches.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    ////// matches by name of team
    @GetMapping("/matches/byTeam/{name}")
    public List<MatchDTO> getMatchesByTeamName(@PathVariable String name) {
        return matchRepo.findMatchesByTeamName(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    //// getMatch By iD
    @GetMapping("/matches/{id}")
    public MatchDTO getMatche(@PathVariable int id) {
        Matches match = matchRepo.findById(id);

        if (match == null) {
            return null;
        } else {
            return convertToDTO(match);
        }
    }

    //// getPlayers By iD match
    @GetMapping("/matches/players/{id}")
    public List<PlayerDTO> getMatchPlayers(@PathVariable int id) {
        Matches match = matchRepo.findById(id);

        if (match == null) {
            return null;
        } else {
            List<MatchTeam> mt = MatchTeamRepository.findByMatchId(id);

            Teams teamA = mt.get(0).getTeam();
            Teams teamB = mt.get(1).getTeam();
            List<PlayerDTO> players = new ArrayList<>();
            players.addAll(convertPlayerToDTO(teamA.getPlayers()));
            players.addAll(convertPlayerToDTO(teamB.getPlayers()));

            return players;
        }
    }

    ///////////// player marque but dans un match d'un team
    @GetMapping("/matches/{id}/team/{idT}/player/{idP}")
    public PlayerDTO PlayerScoredInMatch(@PathVariable("id") int id, @PathVariable("idT") int idT,
            @PathVariable("idP") int idP, @RequestParam(required = false) Integer minute) {
        PlayerController.addGoal(idP);
        Players player = playerRepository.findById(idP);
        MatchTeam mt = MatchTeamRepository.findByMatchIdAndTeamId(id, idT);
        mt.setGoals(mt.getGoals() + 1);
        MatchTeamRepository.save(mt);
        Teams team = mt.getTeam();

        MatchEvents goalEvent = new MatchEvents();
        goalEvent.setMatchID(id);
        goalEvent.setPlayerID(idP);
        goalEvent.setTeamID(idT);
        goalEvent.setMinute(minute != null ? minute : 0);
        goalEvent.setAdditionalInfo("Goal scored by " + player.getName() + " for " + team.getName());
        matchEventsRepository.save(goalEvent);

        List<Favorites> teamFavorites = favoritesRepo.findByTypeAndOwnerID("team", team.getId());

        for (Favorites favorite : teamFavorites) {
            Notifications notification = new Notifications();
            notification.setSupporter(favorite.getSupporter());
            notification.setContent(String.format("GOALLLLLLLL! %s a marqué un but! par : %s , Score: %d",
                    team.getName(), player.getName(), mt.getGoals()));
            notification.setDateOfSend(LocalDateTime.now());
            notification.setIsRead(false);
            notificationsRepo.save(notification);
        }
        return convertPlayerToDTO(player);
    }

    /////////////////// matches par etat
    @GetMapping("/matches/etat/{name}")
    public List<MatchDTO> getMatchesByStatut(@PathVariable("name") String name) {
        List<Matches> m = matchRepo.findByStatus(name);
        return m.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // matches by Date
    @GetMapping("/matches/getdate/{datee}")
    public List<MatchDTO> getMatcheByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datee) {
        List<Matches> matchs = matchRepo.findAll();

        List<Matches> filteredMatches = matchs.stream()
                .filter(match -> match.getDateOfMatch().toLocalDate().equals(datee))
                .collect(Collectors.toList());

        if (filteredMatches.isEmpty()) {
            return null;
        } else {
            return filteredMatches.stream().map(this::convertToDTO).collect(Collectors.toList());
        }
    }

    // find matches by stade
    @GetMapping("/matches/stade/{id}")
    public List<MatchDTO> getMatcheByStade(@PathVariable int id) {
        Stades st = StadeRepository.findById(id);

        if (st == null) {
            return null;
        } else {
            List<Matches> matches = st.getMatches();
            return matches.stream().map(this::convertToDTO).collect(Collectors.toList());
        }
    }

    //////////////////////////////////////// admin

    ///////////// changer match etat
    @GetMapping("/etat/{id}/{etat}")
    public void MatchChangeEtat(@PathVariable("id") int id, @PathVariable String etat) {
        Matches match = matchRepo.findById(id);
        if (match == null) {
            return;
        }
        String oldStatus = match.getStatus();
        match.setStatus(etat);
        matchRepo.save(match);
        List<MatchTeam> matchTeams = MatchTeamRepository.findByMatchId(id);
        if (("DIRECT".equalsIgnoreCase(etat) || "started".equalsIgnoreCase(etat) || "commence".equalsIgnoreCase(etat))
                && !"DIRECT".equalsIgnoreCase(oldStatus)
                && !"STARTED".equalsIgnoreCase(oldStatus)
                && !"commence".equalsIgnoreCase(oldStatus)) {
            List<Favorites> matchFavorites = favoritesRepo.findByTypeAndOwnerID("match", match.getId());
            String matchDescription = "Match";
            if (matchTeams != null && matchTeams.size() >= 2) {
                matchDescription = String.format("%s vs %s",
                        matchTeams.get(0).getTeam().getName(),
                        matchTeams.get(1).getTeam().getName());
            }
            for (Favorites favorite : matchFavorites) {
                Notifications notification = new Notifications();
                notification.setSupporter(favorite.getSupporter());
                notification.setContent(String.format("🏁 Le match commence ! Match Entre  %s", matchDescription));
                notification.setDateOfSend(LocalDateTime.now());
                notification.setIsRead(false);
                notificationsRepo.save(notification);
            }
            if (matchTeams != null && matchTeams.size() >= 2) {
                for (MatchTeam matchTeam : matchTeams) {
                    Teams team = matchTeam.getTeam();
                    List<Favorites> teamFavorites = favoritesRepo.findByTypeAndOwnerID("team", team.getId());

                    for (Favorites favorite : teamFavorites) {
                        Notifications notification = new Notifications();
                        notification.setSupporter(favorite.getSupporter());
                        notification
                                .setContent(String.format("🏁 Le match de %s commence maintenant!", team.getName()));
                        notification.setDateOfSend(LocalDateTime.now());
                        notification.setIsRead(false);
                        notificationsRepo.save(notification);
                    }
                }
            }
        }
        if (("termine".equalsIgnoreCase(etat) || "FINISHED".equalsIgnoreCase(etat))
                && !"termine".equalsIgnoreCase(oldStatus)
                && !"FINISHED".equalsIgnoreCase(oldStatus)) {
            List<Favorites> matchFavorites = favoritesRepo.findByTypeAndOwnerID("match", match.getId());
            String matchDescription = "Match";
            if (matchTeams != null && matchTeams.size() >= 2) {
                matchDescription = String.format("%s vs %s",
                        matchTeams.get(0).getTeam().getName(),
                        matchTeams.get(1).getTeam().getName());
            }
            for (Favorites favorite : matchFavorites) {
                Notifications notification = new Notifications();
                notification.setSupporter(favorite.getSupporter());
                notification.setContent(String.format("🏁 Le match Terminé ! Match Entre  %s", matchDescription));
                notification.setDateOfSend(LocalDateTime.now());
                notification.setIsRead(false);
                notificationsRepo.save(notification);
            }
            if (matchTeams != null && matchTeams.size() >= 2) {
                for (MatchTeam matchTeam : matchTeams) {
                    Teams team = matchTeam.getTeam();
                    List<Favorites> teamFavorites = favoritesRepo.findByTypeAndOwnerID("team", team.getId());
                    for (Favorites favorite : teamFavorites) {
                        Notifications notification = new Notifications();
                        notification.setSupporter(favorite.getSupporter());
                        notification
                                .setContent(
                                        String.format(" Le match de %s est Terminé!   🏁", team.getName()));
                        notification.setDateOfSend(LocalDateTime.now());
                        notification.setIsRead(false);
                        notificationsRepo.save(notification);
                    }
                }
            }
            if ("Group stage".equalsIgnoreCase(match.getType())) {
                if (matchTeams != null && matchTeams.size() >= 2) {
                    updateGroupStatistics(match, matchTeams);
                }
            }
            evaluatePredictions(match);
        }
    }

    ////////////////// methode interieur
    private void evaluatePredictions(Matches match) {
        List<Predictions> predictions = predictionRepository.findByMatchId(match.getId());
        if (predictions == null || predictions.isEmpty()) {
            return;
        }
        List<MatchTeam> mt = MatchTeamRepository.findByMatchId(match.getId());
        Teams actualWinner = null;
        int t1 = mt.get(0).getGoals();
        int t2 = mt.get(1).getGoals();
        if (t1 > t2) {
            actualWinner = mt.get(0).getTeam();
        } else if (t1 < t2) {
            actualWinner = mt.get(1).getTeam();
        } else {
            actualWinner = null;
        }
        for (Predictions prediction : predictions) {
            if (!"pending".equalsIgnoreCase(prediction.getStatus())) {
                continue;
            }
            Supporters supporter = prediction.getSupporter();
            int currentPoints = supporter.getTotalPoints();
            if (actualWinner == null) {
                prediction.setStatus("incorrect");
                prediction.setPoints(0);
                supporter.setTotalPoints(currentPoints);

            } else if (prediction.getPredictedWinner() == actualWinner.getId()) {
                prediction.setStatus("correct");
                prediction.setPoints(12);
                supporter.setTotalPoints(currentPoints + 12);

            } else {
                prediction.setStatus("incorrect");
                prediction.setPoints(-5);
                supporter.setTotalPoints(currentPoints);
            }
            predictionRepository.save(prediction);
            supporterRepository.save(supporter);
        }
    }

    //////////////// methode interieur
    private void updateGroupStatistics(Matches match, List<MatchTeam> matchTeams) {
        MatchTeam team1Match = matchTeams.get(0);
        MatchTeam team2Match = matchTeams.get(1);
        int team1Goals = team1Match.getGoals();
        int team2Goals = team2Match.getGoals();
        List<GroupTeam> groupTeams1 = groupTeamRepository.findByTeamId(team1Match.getTeam().getId());
        if (groupTeams1 == null || groupTeams1.isEmpty()) {
            return;
        }
        GroupTeam groupTeam1 = groupTeams1.get(0);
        int groupId = groupTeam1.getGroup().getId();
        GroupTeam groupTeam2 = groupTeamRepository.findByGroupIdAndTeamId(groupId, team2Match.getTeam().getId());
        if (groupTeam2 == null) {
            return;
        }
        groupTeam1.setGoalsScored(groupTeam1.getGoalsScored() + team1Goals);
        groupTeam1.setGoalsConceded(groupTeam1.getGoalsConceded() + team2Goals);
        groupTeam2.setGoalsScored(groupTeam2.getGoalsScored() + team2Goals);
        groupTeam2.setGoalsConceded(groupTeam2.getGoalsConceded() + team1Goals);
        List<MatchTeam> mt = MatchTeamRepository.findByMatchId(match.getId());
        Teams winner = null;
        int t1 = mt.get(0).getGoals();
        int t2 = mt.get(1).getGoals();
        if (t1 > t2) {
            winner = mt.get(0).getTeam();
        } else if (t1 < t2) {
            winner = mt.get(1).getTeam();
        } else {
            winner = null;
        }
        if (winner != null) {
            if (winner.getId() == team1Match.getTeam().getId()) {
                groupTeam1.setWins(groupTeam1.getWins() + 1);
                groupTeam2.setLoses(groupTeam2.getLoses() + 1);
            } else {
                groupTeam2.setWins(groupTeam2.getWins() + 1);
                groupTeam1.setLoses(groupTeam1.getLoses() + 1);
            }
        } else {
            groupTeam1.setDraws(groupTeam1.getDraws() + 1);
            groupTeam2.setDraws(groupTeam2.getDraws() + 1);
        }
        groupTeamRepository.save(groupTeam1);
        groupTeamRepository.save(groupTeam2);
    }

    // delete match
    @DeleteMapping("/matches/delete/{id}")
    public boolean deleteMatch(@PathVariable int id) {
        Matches m = matchRepo.findById(id);
        if (m == null) {
            return false;
        } else {
            matchRepo.deleteById(id);
            return true;
        }
    }

    @PutMapping("matches/update/{id}")
    public void updateMatche(@PathVariable int id, @RequestBody Matches m) {
        Matches ma = matchRepo.findById(id);
        if (ma != null) {
            ma.setDateOfMatch(m.getDateOfMatch());
            ma.setStade(m.getStade());
            ma.setStatus(m.getStatus());
            ma.setType(m.getType());
            matchRepo.save(ma);
        }
    }

    // add match
    @PostMapping("/matches/add")
    public boolean addMatch(@RequestBody Matches m) {
        if (m == null) {
            return false;
        } else {
            matchRepo.save(m);
            return true;
        }
    }

    ////////////////////////////////// convert
    private MatchDTO convertToDTO(Matches match) {
        MatchDTO dto = new MatchDTO();
        List<MatchTeam> mt = MatchTeamRepository.findByMatchId(match.getId());
        List<MatchEvents> events = matchEventsRepository.findByMatchID(match.getId());
        List<MatchPlayer> players = matchPlayerRepository.findByMatchID(match.getId());

        dto.setId(match.getId());
        dto.setDateOfMatch(match.getDateOfMatch());
        dto.setReferee(match.getReferee());
        dto.setStatut(match.getStatus());
        dto.setType(match.getType());
        dto.setTreeId(match.getTreeID());
        dto.setMatchTeams(convertMatchTeamToDTO(mt));
        dto.setMatchEvents(convertMatchEventsToDTO(events));
        dto.setMatchPlayers(convertMatchPlayerToDTO(players));

        if (match.getStade() != null) {
            dto.setStadeId(match.getStade().getId());
            dto.setStadeName(match.getStade().getName());
            dto.setImageUrl(match.getStade().getImageUrl());
        }

        return dto;
    }

    private MatchTeamDTO convertMatchTeamToDTO(MatchTeam cc) {
        MatchTeamDTO mt = new MatchTeamDTO();
        mt.setId(cc.getId());
        mt.setMatchId(cc.getMatch().getId());
        mt.setTeamId(cc.getTeam().getId());
        mt.setGoals(cc.getGoals());
        mt.setTeamName(cc.getTeam().getName());
        mt.setImageUrl(cc.getTeam().getImageUrl());
        mt.setPosition(cc.getPosition());
        return mt;
    }

    private List<MatchTeamDTO> convertMatchTeamToDTO(List<MatchTeam> cc) {
        return cc.stream()
                .map(this::convertMatchTeamToDTO)
                .collect(Collectors.toList());
    }

    private MatchEventsDTO convertMatchEventToDTO(MatchEvents event) {
        MatchEventsDTO dto = new MatchEventsDTO();
        dto.setId(event.getId());
        dto.setMatchID(event.getMatchID());
        dto.setPlayerID(event.getPlayerID());
        dto.setTeamID(event.getTeamID());

        dto.setMinute(event.getMinute());
        dto.setAdditionalInfo(event.getAdditionalInfo());

        // Ajouter les noms pour l'affichage
        Players player = playerRepository.findById(event.getPlayerID());
        Teams team = teamRepository.findById(event.getTeamID()).orElse(null);

        if (player != null) {
            dto.setPlayerName(player.getName());
        }
        if (team != null) {
            dto.setTeamName(team.getName());
        }

        return dto;
    }

    @DeleteMapping("/matches/events/delete/{id}")
    public boolean deleteMatchEvent(@PathVariable int id) {
        MatchEvents event = matchEventsRepository.findById(id).orElse(null);
        if (event == null) {
            return false;
        }
        matchEventsRepository.deleteById(id);
        return true;
    }

    @GetMapping("/matches/{id}/events")
    public List<MatchEventsDTO> getMatchEvents(@PathVariable int id) {
        List<MatchEvents> events = matchEventsRepository.findByMatchID(id);
        return convertMatchEventsToDTO(events);
    }

    @GetMapping("/players/{id}/events")
    public List<MatchEventsDTO> getPlayerEvents(@PathVariable int id) {
        List<MatchEvents> events = matchEventsRepository.findByPlayerID(id);
        return convertMatchEventsToDTO(events);
    }

    ///////////// Mettre à jour un événement
    @PutMapping("/matches/events/update/{id}")
    public MatchEventsDTO updateMatchEvent(@PathVariable int id, @RequestBody MatchEvents updatedEvent) {
        MatchEvents existingEvent = matchEventsRepository.findById(id).orElse(null);
        if (existingEvent == null) {
            return null;
        }

        existingEvent.setMinute(updatedEvent.getMinute());
        existingEvent.setAdditionalInfo(updatedEvent.getAdditionalInfo());

        MatchEvents saved = matchEventsRepository.save(existingEvent);
        return convertMatchEventToDTO(saved);
    }

    @PostMapping("/matches/events/add")
    public MatchEventsDTO addMatchEvent(@RequestBody MatchEvents event) {
        if (event == null) {
            return null;
        }

        Matches match = matchRepo.findById(event.getMatchID());
        if (match == null) {
            return null;
        }
        Players player = playerRepository.findById(event.getPlayerID());
        if (player == null) {
            return null;
        }

        MatchEvents savedEvent = matchEventsRepository.save(event);

        Teams team = teamRepository.findById(event.getTeamID()).orElse(null);
        if (team != null) {
            List<Favorites> teamFavorites = favoritesRepo.findByTypeAndOwnerID("team", team.getId());

            for (Favorites favorite : teamFavorites) {
                Notifications notification = new Notifications();
                notification.setSupporter(favorite.getSupporter());
                notification.setContent(String.format("⚠️ %s - %s de %s (minute %d)",
                        event.getAdditionalInfo(),
                        player.getName(),
                        team.getName(),
                        event.getMinute() != null ? event.getMinute() : 0));
                notification.setDateOfSend(LocalDateTime.now());
                notification.setIsRead(false);
                notificationsRepo.save(notification);
            }
        }

        return convertMatchEventToDTO(savedEvent);
    }

    ///////////// Ajouter un joueur à un match (lineup)
    @PostMapping("/matches/players/add")
    public MatchPlayerDTO addMatchPlayer(@RequestBody MatchPlayer matchPlayer) {
        if (matchPlayer == null) {
            return null;
        }

        // Vérifier que le match existe
        Matches match = matchRepo.findById(matchPlayer.getMatchID());
        if (match == null) {
            return null;
        }

        // Vérifier que le joueur existe
        Players player = playerRepository.findById(matchPlayer.getPlayerID());
        if (player == null) {
            return null;
        }

        // Sauvegarder le joueur dans le match
        MatchPlayer savedMatchPlayer = matchPlayerRepository.save(matchPlayer);
        return convertMatchPlayerToDTO(savedMatchPlayer);
    }

    ///////////// Ajouter plusieurs joueurs à un match (lineup complète)
    @PostMapping("/matches/{id}/players/addMultiple")
    public List<MatchPlayerDTO> addMultipleMatchPlayers(@PathVariable int id,
            @RequestBody List<MatchPlayer> players) {
        Matches match = matchRepo.findById(id);
        if (match == null || players == null) {
            return null;
        }

        // Définir le matchID pour tous les joueurs
        players.forEach(player -> player.setMatchID(id));

        // Sauvegarder tous les joueurs
        List<MatchPlayer> savedPlayers = matchPlayerRepository.saveAll(players);
        return convertMatchPlayerToDTO(savedPlayers);
    }

    ///////////// Supprimer un joueur d'un match
    @DeleteMapping("/matches/players/delete/{id}")
    public boolean deleteMatchPlayer(@PathVariable int id) {
        MatchPlayer matchPlayer = matchPlayerRepository.findById(id).orElse(null);
        if (matchPlayer == null) {
            return false;
        }
        matchPlayerRepository.deleteById(id);
        return true;
    }

    ///////////// Obtenir tous les joueurs d'un match
    @GetMapping("/matches/{id}/players/lineup")
    public List<MatchPlayerDTO> getMatchPlayersLineup(@PathVariable int id) {
        List<MatchPlayer> players = matchPlayerRepository.findByMatchID(id);
        return convertMatchPlayerToDTO(players);
    }

    ///////////// Obtenir les joueurs titulaires d'un match
    @GetMapping("/matches/{id}/players/starters")
    public List<MatchPlayerDTO> getMatchStarters(@PathVariable int id) {
        List<MatchPlayer> starters = matchPlayerRepository.findByMatchIDAndIsStarter(id, true);
        return convertMatchPlayerToDTO(starters);
    }

    ///////////// Obtenir les remplaçants d'un match
    @GetMapping("/matches/{id}/players/substitutes")
    public List<MatchPlayerDTO> getMatchSubstitutes(@PathVariable int id) {
        List<MatchPlayer> substitutes = matchPlayerRepository.findByMatchIDAndIsStarter(id, false);
        return convertMatchPlayerToDTO(substitutes);
    }

    ///////////// Obtenir les joueurs d'une équipe dans un match
    @GetMapping("/matches/{matchId}/team/{teamId}/players")
    public List<MatchPlayerDTO> getTeamPlayersInMatch(@PathVariable int matchId, @PathVariable int teamId) {
        List<MatchPlayer> players = matchPlayerRepository.findByMatchIDAndTeamID(matchId, teamId);
        return convertMatchPlayerToDTO(players);
    }

    ///////////// Obtenir les titulaires d'une équipe dans un match
    @GetMapping("/matches/{matchId}/team/{teamId}/starters")
    public List<MatchPlayerDTO> getTeamStartersInMatch(@PathVariable int matchId, @PathVariable int teamId) {
        List<MatchPlayer> players = matchPlayerRepository.findByMatchIDAndTeamID(matchId, teamId);
        return players.stream()
                .filter(MatchPlayer::isStarter)
                .map(this::convertMatchPlayerToDTO)
                .collect(Collectors.toList());
    }

    ///////////// Obtenir les remplaçants d'une équipe dans un match
    @GetMapping("/matches/{matchId}/team/{teamId}/substitutes")
    public List<MatchPlayerDTO> getTeamSubstitutesInMatch(@PathVariable int matchId, @PathVariable int teamId) {
        List<MatchPlayer> players = matchPlayerRepository.findByMatchIDAndTeamID(matchId, teamId);
        return players.stream()
                .filter(p -> !p.isStarter())
                .map(this::convertMatchPlayerToDTO)
                .collect(Collectors.toList());
    }

    ///////////// Mettre à jour les statistiques d'un joueur dans un match
    @PutMapping("/matches/players/update/{id}")
    public MatchPlayerDTO updateMatchPlayer(@PathVariable int id, @RequestBody MatchPlayer updatedPlayer) {
        MatchPlayer existingPlayer = matchPlayerRepository.findById(id).orElse(null);
        if (existingPlayer == null) {
            return null;
        }

        if (updatedPlayer.getMinutesPlayed() != null) {
            existingPlayer.setMinutesPlayed(updatedPlayer.getMinutesPlayed());
        }
        if (updatedPlayer.getRating() != null) {
            existingPlayer.setRating(updatedPlayer.getRating());
        }
        if (updatedPlayer.getPosition() != null) {
            existingPlayer.setPosition(updatedPlayer.getPosition());
        }
        if (updatedPlayer.getJerseyNumber() != null) {
            existingPlayer.setJerseyNumber(updatedPlayer.getJerseyNumber());
        }

        MatchPlayer saved = matchPlayerRepository.save(existingPlayer);
        return convertMatchPlayerToDTO(saved);
    }

    ///////////// Changer un joueur de titulaire à remplaçant ou vice-versa
    @PutMapping("/matches/players/{id}/toggle-starter")
    public MatchPlayerDTO togglePlayerStarter(@PathVariable int id) {
        MatchPlayer player = matchPlayerRepository.findById(id).orElse(null);
        if (player == null) {
            return null;
        }

        player.setStarter(!player.isStarter());
        MatchPlayer saved = matchPlayerRepository.save(player);
        return convertMatchPlayerToDTO(saved);
    }

    ///////////// Mettre à jour les minutes jouées d'un joueur
    @PutMapping("/matches/players/{id}/minutes/{minutes}")
    public MatchPlayerDTO updatePlayerMinutes(@PathVariable int id, @PathVariable int minutes) {
        MatchPlayer player = matchPlayerRepository.findById(id).orElse(null);
        if (player == null) {
            return null;
        }

        player.setMinutesPlayed(minutes);
        MatchPlayer saved = matchPlayerRepository.save(player);
        return convertMatchPlayerToDTO(saved);
    }

    ///////////// Mettre à jour la note d'un joueur
    @PutMapping("/matches/players/{id}/rating/{rating}")
    public MatchPlayerDTO updatePlayerRating(@PathVariable int id, @PathVariable double rating) {
        MatchPlayer player = matchPlayerRepository.findById(id).orElse(null);
        if (player == null) {
            return null;
        }

        player.setRating(rating);
        MatchPlayer saved = matchPlayerRepository.save(player);
        return convertMatchPlayerToDTO(saved);
    }

    ///////////// Supprimer tous les joueurs d'un match (réinitialiser le lineup)
    @DeleteMapping("/matches/{id}/players/clear")
    public boolean clearMatchLineup(@PathVariable int id) {
        List<MatchPlayer> players = matchPlayerRepository.findByMatchID(id);
        if (players == null || players.isEmpty()) {
            return false;
        }

        players.forEach(player -> matchPlayerRepository.deleteById(player.getId()));
        return true;
    }

    ///////////// Obtenir un joueur spécifique dans un match
    @GetMapping("/matches/player/{id}")
    public MatchPlayerDTO getMatchPlayerById(@PathVariable int id) {
        MatchPlayer player = matchPlayerRepository.findById(id).orElse(null);
        if (player == null) {
            return null;
        }
        return convertMatchPlayerToDTO(player);
    }

    private MatchPlayerDTO convertMatchPlayerToDTO(MatchPlayer mp) {
        MatchPlayerDTO dto = new MatchPlayerDTO();
        dto.setId(mp.getId());
        dto.setMatchID(mp.getMatchID());
        dto.setTeamID(mp.getTeamID());
        dto.setPlayerID(mp.getPlayerID());
        dto.setStarter(mp.isStarter());
        dto.setPosition(mp.getPosition());
        dto.setJerseyNumber(mp.getJerseyNumber());
        dto.setMinutesPlayed(mp.getMinutesPlayed());
        dto.setRating(mp.getRating());

        // Ajouter les infos du joueur pour l'affichage
        Players player = playerRepository.findById(mp.getPlayerID());
        if (player != null) {
            dto.setPlayerName(player.getName());
            dto.setPlayerImgUrl(player.getImgUrl());
        }

        return dto;
    }

    private List<MatchPlayerDTO> convertMatchPlayerToDTO(List<MatchPlayer> players) {
        return players.stream()
                .map(this::convertMatchPlayerToDTO)
                .collect(Collectors.toList());
    }

    private List<MatchEventsDTO> convertMatchEventsToDTO(List<MatchEvents> events) {
        return events.stream()
                .map(this::convertMatchEventToDTO)
                .collect(Collectors.toList());
    }

    private TeamDTO convertTeamToDTO(Teams team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setCoach(team.getCoach());
        dto.setCountry(team.getCountry());
        dto.setImageUrl(team.getImageUrl());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());

        return dto;
    }

    private PlayerDTO convertPlayerToDTO(Players player) {
        PlayerDTO dto = new PlayerDTO();
        dto.setId(player.getId());
        dto.setGoals(player.getGoals());
        dto.setHeight(player.getHeight());
        dto.setTeam(player.getTeam().getName());
        dto.setWeight(player.getWeight());
        dto.setName(player.getName());
        dto.setTeamId(player.getTeam().getId());
        dto.setAge(player.getAge());

        return dto;
    }

    private List<PlayerDTO> convertPlayerToDTO(List<Players> player) {
        return player.stream()
                .map(this::convertPlayerToDTO)
                .collect(Collectors.toList());
    }
}