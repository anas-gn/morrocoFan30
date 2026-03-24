package com.example.demo.controllers;

import com.example.demo.models.*;
import com.example.demo.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/teams")
public class TeamsController {

    @Autowired
    private TeamRepository teamsRepository;

    @Autowired
    private PlayerRepository playersRepository;

    @Autowired
    private CultureRepository culturesRepository;

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private MatchTeamRepository matchTeamRepository;

    // ==================== DITI2OWAT ====================

    // Pash ndiro get ga3 teams
    public static class TeamSummaryDTO {
        private int id;
        private String country;
        private String name;
        private String imageUrl;
        private String coach;
        private int participation;
        private String description;
        private int newsCount;

        public TeamSummaryDTO(Teams team, int newsCount) {
            this.id = team.getId();
            this.country = team.getCountry();
            this.name = team.getName();
            this.imageUrl = team.getImageUrl();
            this.coach = team.getCoach();
            this.participation = team.getParticipation();
            this.description = team.getDescription();
            this.newsCount = newsCount;
        }

        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getCoach() { return coach; }
        public void setCoach(String coach) { this.coach = coach; }
        public int getParticipation() { return participation; }
        public void setParticipation(int participation) { this.participation = participation; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public int getNewsCount() { return newsCount; }
        public void setNewsCount(int newsCount) { this.newsCount = newsCount; }
    }

    // pash team wa7d p ga3 les infos w players w cultures wlkhra kaml
    public static class TeamDetailDTO {
        private int id;
        private String country;
        private String name;
        private String imageUrl;
        private String coach;
        private int participation;
        private String description;
        private List<PlayerDTO> players;
        private List<NewsDTO> news;
        private List<CultureDTO> cultures;
        private List<MatchDTO> matches;

        public TeamDetailDTO(Teams team, List<PlayerDTO> players, List<NewsDTO> news, 
                           List<CultureDTO> cultures, List<MatchDTO> matches) {
            this.id = team.getId();
            this.country = team.getCountry();
            this.name = team.getName();
            this.imageUrl = team.getImageUrl();
            this.coach = team.getCoach();
            this.participation = team.getParticipation();
            this.description = team.getDescription();
            this.players = players;
            this.news = news;
            this.cultures = cultures;
            this.matches = matches;
        }

        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getCoach() { return coach; }
        public void setCoach(String coach) { this.coach = coach; }
        public int getParticipation() { return participation; }
        public void setParticipation(int participation) { this.participation = participation; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<PlayerDTO> getPlayers() { return players; }
        public void setPlayers(List<PlayerDTO> players) { this.players = players; }
        public List<NewsDTO> getNews() { return news; }
        public void setNews(List<NewsDTO> news) { this.news = news; }
        public List<CultureDTO> getCultures() { return cultures; }
        public void setCultures(List<CultureDTO> cultures) { this.cultures = cultures; }
        public List<MatchDTO> getMatches() { return matches; }
        public void setMatches(List<MatchDTO> matches) { this.matches = matches; }
    }

    // Player DTO
    public static class PlayerDTO {
        private int id;
        private String imgUrl;
        private String name;
        private double height;
        private double weight;
        private int goals;
        private int age;

        public PlayerDTO(Players player) {
            this.id = player.getId();
            this.imgUrl = player.getImgUrl();
            this.name = player.getName();
            this.height = player.getHeight();
            this.weight = player.getWeight();
            this.goals = player.getGoals();
            this.age = player.getAge();
        }

        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getImgUrl() { return imgUrl; }
        public void setImgUrl(String imgUrl) { this.imgUrl = imgUrl; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getHeight() { return height; }
        public void setHeight(double height) { this.height = height; }
        public double getWeight() { return weight; }
        public void setWeight(double weight) { this.weight = weight; }
        public int getGoals() { return goals; }
        public void setGoals(int goals) { this.goals = goals; }
        public int getAge() { return age; }
        public void setAge(int age) { this.age = age; }
    }

    // News DTO
    public static class NewsDTO {
        private int id;
        private String title;
        private String description;
        private String detail;
        private String imageUrl;
        private LocalDateTime dateOfCreation;

        public NewsDTO(News news) {
            this.id = news.getId();
            this.title = news.getTitle();
            this.description = news.getDescription();
            this.detail = news.getDetail();
            this.imageUrl = news.getImageUrl();
            this.dateOfCreation = news.getDateOfCreation();
        }

        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getDetail() { return detail; }
        public void setDetail(String detail) { this.detail = detail; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public LocalDateTime getDateOfCreation() { return dateOfCreation; }
        public void setDateOfCreation(LocalDateTime dateOfCreation) { this.dateOfCreation = dateOfCreation; }
    }

    // Culture DTO
    public static class CultureDTO {
        private int id;
        private String title;
        private String description;
        private String imageUrl;

        public CultureDTO(Cultures culture) {
            this.id = culture.getId();
            this.title = culture.getTitle();
            this.description = culture.getDescription();
            this.imageUrl = culture.getImageUrl();
        }

        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    // Match DTO
    public static class MatchDTO {
        private int id;
        private String dateOfMatch;
        private String referee;
        private String status;
        private String type;
        private int goals;
        private String opponentName;
        private int opponentGoals;

        public MatchDTO(int id, String dateOfMatch, String referee, String status, 
                       String type, int goals, String opponentName, int opponentGoals) {
            this.id = id;
            this.dateOfMatch = dateOfMatch;
            this.referee = referee;
            this.status = status;
            this.type = type;
            this.goals = goals;
            this.opponentName = opponentName;
            this.opponentGoals = opponentGoals;
        }

        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getDateOfMatch() { return dateOfMatch; }
        public void setDateOfMatch(String dateOfMatch) { this.dateOfMatch = dateOfMatch; }
        public String getReferee() { return referee; }
        public void setReferee(String referee) { this.referee = referee; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public int getGoals() { return goals; }
        public void setGoals(int goals) { this.goals = goals; }
        public String getOpponentName() { return opponentName; }
        public void setOpponentName(String opponentName) { this.opponentName = opponentName; }
        public int getOpponentGoals() { return opponentGoals; }
        public void setOpponentGoals(int opponentGoals) { this.opponentGoals = opponentGoals; }
    }

    // pash ndiro create team p players + cultures dialo w zmr kaml
    public static class CreateTeamDTO {
        private String country;
        private String name;
        private String imageUrl;
        private String coach;
        private int participation;
        private String description;
        private List<CreatePlayerDTO> players;
        private List<CreateCultureDTO> cultures;

        // Getters and Setters
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getCoach() { return coach; }
        public void setCoach(String coach) { this.coach = coach; }
        public int getParticipation() { return participation; }
        public void setParticipation(int participation) { this.participation = participation; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<CreatePlayerDTO> getPlayers() { return players; }
        public void setPlayers(List<CreatePlayerDTO> players) { this.players = players; }
        public List<CreateCultureDTO> getCultures() { return cultures; }
        public void setCultures(List<CreateCultureDTO> cultures) { this.cultures = cultures; }
    }

    // Create Player DTO
    public static class CreatePlayerDTO {
        private String imgUrl;
        private String name;
        private double height;
        private double weight;
        private int goals;
        private int age;

        // Getters and Setters
        public String getImgUrl() { return imgUrl; }
        public void setImgUrl(String imgUrl) { this.imgUrl = imgUrl; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getHeight() { return height; }
        public void setHeight(double height) { this.height = height; }
        public double getWeight() { return weight; }
        public void setWeight(double weight) { this.weight = weight; }
        public int getGoals() { return goals; }
        public void setGoals(int goals) { this.goals = goals; }
        public int getAge() { return age; }
        public void setAge(int age) { this.age = age; }
    }

    // Create Culture DTO
    public static class CreateCultureDTO {
        private String title;
        private String description;
        private String imageUrl;

        // Getters and Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    // DTO for UPDATE
    public static class UpdateTeamDTO {
        private String country;
        private String name;
        private String imageUrl;
        private String coach;
        private int participation;
        private String description;

        // Getters and Setters
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getCoach() { return coach; }
        public void setCoach(String coach) { this.coach = coach; }
        public int getParticipation() { return participation; }
        public void setParticipation(int participation) { this.participation = participation; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    // ==================== ENDPOINTS ====================

    // get ga3 teams
    @GetMapping("/getAll")
    public ResponseEntity<List<TeamSummaryDTO>> getAllTeams() {
        try {
            List<Teams> teams = teamsRepository.findAll();
            List<TeamSummaryDTO> teamSummaries = teams.stream()
                .map(team -> {
                    int newsCount = team.getNews() != null ? team.getNews().size() : 0;
                    return new TeamSummaryDTO(team, newsCount);
                })
                .collect(Collectors.toList());
            
            return new ResponseEntity<>(teamSummaries, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // get team wa7d
    @GetMapping("/getOne/{id}")
    public ResponseEntity<TeamDetailDTO> getOneTeam(@PathVariable int id) {
        try {
            Teams team = teamsRepository.findById(id).orElse(null);
            
            if (team == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }

            // players
            List<PlayerDTO> players = team.getPlayers() != null ? 
                team.getPlayers().stream()
                    .map(PlayerDTO::new)
                    .collect(Collectors.toList()) : 
                new ArrayList<>();

            // news
            List<NewsDTO> news = team.getNews() != null ? 
                team.getNews().stream()
                    .sorted(Comparator.comparing(News::getDateOfCreation).reversed())
                    .map(NewsDTO::new)
                    .collect(Collectors.toList()) : 
                new ArrayList<>();

            // cultures
            List<CultureDTO> cultures = team.getCultures() != null ? 
                team.getCultures().stream()
                    .map(CultureDTO::new)
                    .collect(Collectors.toList()) : 
                new ArrayList<>();

            // matches
            List<MatchTeam> matchTeams = matchTeamRepository.findByTeamId(id);
            List<MatchDTO> matches = new ArrayList<>();
            
            for (MatchTeam mt : matchTeams) {
                Matches match = mt.getMatch();
                
                // nl9aw team li ayl3p dedo
                List<MatchTeam> allTeamsInMatch = matchTeamRepository.findByMatchId(match.getId());
                MatchTeam opponentMT = allTeamsInMatch.stream()
                    .filter(m -> m.getTeam().getId() != id)
                    .findFirst()
                    .orElse(null);
                
                String opponentName = opponentMT != null ? opponentMT.getTeam().getName() : "Unknown";
                int opponentGoals = opponentMT != null ? opponentMT.getGoals() : 0;
                
                MatchDTO matchDTO = new MatchDTO(
                    match.getId(),
                    match.getDateOfMatch() != null ? match.getDateOfMatch().toString() : "",
                    match.getReferee(),
                    match.getStatus(),
                    match.getType(),
                    mt.getGoals(),
                    opponentName,
                    opponentGoals
                );
                matches.add(matchDTO);
            }

            TeamDetailDTO teamDetail = new TeamDetailDTO(team, players, news, cultures, matches);
            return new ResponseEntity<>(teamDetail, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ajouter team p players w cultures dialo
    @PostMapping("/add")
    public ResponseEntity<Teams> createTeam(@RequestBody CreateTeamDTO createTeamDTO) {
        try {
            Teams team = new Teams();
            team.setCountry(createTeamDTO.getCountry());
            team.setName(createTeamDTO.getName());
            team.setImageUrl(createTeamDTO.getImageUrl());
            team.setCoach(createTeamDTO.getCoach());
            team.setParticipation(createTeamDTO.getParticipation());
            team.setDescription(createTeamDTO.getDescription());
            Teams savedTeam = teamsRepository.save(team);

            // Add players
            if (createTeamDTO.getPlayers() != null) {
                for (CreatePlayerDTO playerDTO : createTeamDTO.getPlayers()) {
                    Players player = new Players();
                    player.setImgUrl(playerDTO.getImgUrl());
                    player.setName(playerDTO.getName());
                    player.setHeight(playerDTO.getHeight());
                    player.setWeight(playerDTO.getWeight());
                    player.setGoals(playerDTO.getGoals());
                    player.setAge(playerDTO.getAge());
                    player.setTeam(savedTeam);
                    playersRepository.save(player);
                }
            }

            // Add cultures
            if (createTeamDTO.getCultures() != null) {
                for (CreateCultureDTO cultureDTO : createTeamDTO.getCultures()) {
                    Cultures culture = new Cultures();
                    culture.setTitle(cultureDTO.getTitle());
                    culture.setDescription(cultureDTO.getDescription());
                    culture.setImageUrl(cultureDTO.getImageUrl());
                    culture.setTeam(savedTeam);
                    culturesRepository.save(culture);
                }
            }

            return new ResponseEntity<>(savedTeam, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // update team
    @PutMapping("/update/{id}")
    public ResponseEntity<Teams> updateTeam(@PathVariable int id, @RequestBody UpdateTeamDTO updateTeamDTO) {
        try {
            Teams team = teamsRepository.findById(id).orElse(null);
            
            if (team == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }

            team.setCountry(updateTeamDTO.getCountry());
            team.setName(updateTeamDTO.getName());
            team.setImageUrl(updateTeamDTO.getImageUrl());
            team.setCoach(updateTeamDTO.getCoach());
            team.setParticipation(updateTeamDTO.getParticipation());
            team.setDescription(updateTeamDTO.getDescription());

            Teams updatedTeam = teamsRepository.save(team);
            return new ResponseEntity<>(updatedTeam, HttpStatus.OK);
            
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ms7 zmr
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<HttpStatus> deleteTeam(@PathVariable int id) {
        try {
            Teams team = teamsRepository.findById(id).orElse(null);
            
            if (team == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            teamsRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}