package com.example.demo.controllers;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.hooks.CityHostDTO;
import com.example.demo.hooks.CultureDTO;
import com.example.demo.hooks.EventDTO;
import com.example.demo.hooks.GroupDTO;
import com.example.demo.hooks.MatchDTO;
import com.example.demo.hooks.NewsDTO;
import com.example.demo.hooks.StadeDTO;
import com.example.demo.hooks.TeamDTO;
import com.example.demo.models.CityHosts;
import com.example.demo.models.Cultures;
import com.example.demo.models.Events;
import com.example.demo.models.Groups;
import com.example.demo.models.GroupTeam;
import com.example.demo.models.Matches;
import com.example.demo.models.MatchTeam;
import com.example.demo.models.News;
import com.example.demo.models.Stades;
import com.example.demo.models.Teams;

import com.example.demo.repositories.NewsRepository;

import com.example.demo.repositories.CityHostRepository;
import com.example.demo.repositories.CultureRepository;
import com.example.demo.repositories.EventRepository;
import com.example.demo.repositories.GroupRepository;
import com.example.demo.repositories.MatchRepository;
import com.example.demo.repositories.MatchTeamRepository;
import com.example.demo.repositories.StadeRepository;
import com.example.demo.repositories.TeamRepository;

@RestController
@RequestMapping("/api/acceuil")
public class AcceuilController {
    @Autowired
    private TeamRepository TeamRepository;
    @Autowired
    private StadeRepository StadeRepository;
    @Autowired
    private MatchRepository matchRepo;
    @Autowired
    private MatchTeamRepository MatchTeamRepository;
    @Autowired
    private GroupRepository GroupeRepository;
    @Autowired
    private CityHostRepository CityHostRepository;
    @Autowired
    private NewsRepository newsRepository;
    @Autowired
    private CultureRepository cultureRepository;
    @Autowired
    private EventRepository EventRepository;

    public AcceuilController(TeamRepository teamRepository,
            StadeRepository stadeRepository, MatchRepository matchRepo,
            MatchTeamRepository matchTeamRepository, GroupRepository groupeRepository,
            CityHostRepository cityHostRepository, NewsRepository newsRepository, CultureRepository cultureRepository) {
        this.TeamRepository = teamRepository;
        this.StadeRepository = stadeRepository;
        this.matchRepo = matchRepo;
        this.MatchTeamRepository = matchTeamRepository;
        this.GroupeRepository = groupeRepository;
        this.CityHostRepository = cityHostRepository;
        this.newsRepository = newsRepository;
        this.cultureRepository = cultureRepository;
    }

    @GetMapping("/CityHosts/all")
    public List<CityHostDTO> gatAllCities() {
        List<CityHosts> city = CityHostRepository.findAll();
        List<CityHostDTO> cities = city.stream().map(this::convertCityToDTO).collect(Collectors.toList());
        if (cities == null) {
            return null;
        } else {
            return cities;
        }
    }

    @GetMapping("/stade/all")
    public List<StadeDTO> getAllStades() {
        List<Stades> st = StadeRepository.findAll();
        List<StadeDTO> stades = st.stream().map(this::convertStadeToDTO).collect(Collectors.toList());
        if (stades == null) {
            return null;
        } else {
            return stades;
        }
    }

    //////// grp
    @GetMapping("/accueil/groupes")
    public ResponseEntity<List<Map<String, Object>>> getAllStandings() {
        List<Groups> groups = GroupeRepository.findAll();

        List<Map<String, Object>> standings = groups.stream()
                .map(group -> {
                    List<Map<String, Object>> teamStandings = group.getGroupTeams().stream()
                            .sorted(Comparator
                                    .comparingInt((GroupTeam gt) -> (gt.getWins() * 3 + gt.getDraws()))
                                    .reversed()
                                    .thenComparingInt((GroupTeam gt) -> gt.getGoalsScored() - gt.getGoalsConceded())
                                    .reversed()
                                    .thenComparingInt(GroupTeam::getGoalsScored)
                                    .reversed())
                            .map(gt -> {
                                Map<String, Object> team = new HashMap<>();
                                team.put("teamId", gt.getTeam().getId());
                                team.put("country", gt.getTeam().getCountry());
                                team.put("name", gt.getTeam().getName());
                                team.put("imageUrl", gt.getTeam().getImageUrl());
                                team.put("played", gt.getWins() + gt.getDraws() + gt.getLoses());
                                team.put("wins", gt.getWins());
                                team.put("draws", gt.getDraws());
                                team.put("loses", gt.getLoses());
                                team.put("goalsScored", gt.getGoalsScored());
                                team.put("goalsConceded", gt.getGoalsConceded());
                                team.put("goalDifference", gt.getGoalsScored() - gt.getGoalsConceded());
                                team.put("points", gt.getWins() * 3 + gt.getDraws());
                                return team;
                            })
                            .collect(Collectors.toList());

                    Map<String, Object> groupData = new HashMap<>();
                    groupData.put("groupId", group.getId());
                    groupData.put("groupName", group.getName());
                    groupData.put("standings", teamStandings);
                    return groupData;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(standings);
    }

    //////////// upcaming Events
    @GetMapping("/evants/upcaming")
    public List<EventDTO> getUpcaming() {
        List<Events> event = EventRepository.findAll();

        return event.stream()
                .sorted(Comparator.comparing(Events::getDateOfEvent).reversed())
                .limit(5)
                .map(this::convertEventToDTO)
                .collect(Collectors.toList());
    }

    ////////////// news
    @GetMapping("/news/lastest")
    public List<NewsDTO> getLastNews() {
        List<News> news = newsRepository.findAll();

        return news.stream()
                .sorted(Comparator.comparing(News::getDateOfCreation).reversed())
                .limit(7)
                .map(this::convertNewsToDTO)
                .collect(Collectors.toList());
    }

    /////// culture
    @GetMapping("/culture/forYou")
    public List<CultureDTO> getLastCulture() {
        List<Cultures> cul = cultureRepository.findAll();

        return cul.stream()
                .sorted(Comparator.comparing(Cultures::getDateOfCreation).reversed())
                .limit(7)
                .map(this::convertCultureToDTO)
                .collect(Collectors.toList());
    }

    //// some teams
    @GetMapping("/teams/some")
    public List<TeamDTO> getSomeTeams() {
        List<Teams> teams = TeamRepository.findAll();

        return teams.stream().limit(4).map(this::convertTeamToDTO).collect(Collectors.toList());
    }

    /////////// upcaming matches
    @GetMapping("/matches/upcoming")
    public List<Map<String, Object>> getUpcomingMatches() {
        LocalDateTime now = LocalDateTime.now();
        List<Matches> matches = matchRepo.findAll();

        return matches.stream()
                .filter(match -> match.getDateOfMatch().isAfter(now))
                .sorted(Comparator.comparing(Matches::getDateOfMatch))
                .limit(4)
                .map(match -> {
                    Map<String, Object> matchMap = new HashMap<>();
                    matchMap.put("id", match.getId());
                    matchMap.put("dateOfMatch", match.getDateOfMatch());
                    matchMap.put("referee", match.getReferee());
                    matchMap.put("status", match.getStatus());
                    matchMap.put("type", match.getType());
                    matchMap.put("treeId", match.getTreeID());

                    // Ajouter  stade
                    if (match.getStade() != null) {
                        Stades stade = match.getStade();
                        Map<String, Object> stadeMap = new HashMap<>();
                        stadeMap.put("id", stade.getId());
                        stadeMap.put("name", stade.getName());
                    }
                    // Ajouter  équipes
                    List<MatchTeam> matchTeams = MatchTeamRepository.findByMatchId(match.getId());
                    List<Map<String, Object>> teamsList = matchTeams.stream()
                            .map(mt -> {
                                Teams team = mt.getTeam();
                                Map<String, Object> teamMap = new HashMap<>();
                                teamMap.put("teamId", team.getId());
                                teamMap.put("name", team.getName());
                                teamMap.put("country", team.getCountry());
                                teamMap.put("imageUrl", team.getImageUrl());
                                teamMap.put("coach", team.getCoach());
                                teamMap.put("goals", mt.getGoals());
                                return teamMap;
                            })
                            .collect(Collectors.toList());
                    matchMap.put("teams", teamsList);
                    return matchMap;
                })
                .collect(Collectors.toList());
    }

    ///////////////////////////////////////////
    public CityHostDTO convertCityToDTO(CityHosts city) {
        if (city == null) {
            return null;
        } else {
            CityHostDTO dto = new CityHostDTO();
            dto.setId(city.getId());
            dto.setCountry(city.getCountry());
            dto.setDescription(city.getDescription());
            dto.setName(city.getName());
            dto.setRegion(city.getRegion());
            return dto;
        }
    }

    private MatchDTO convertToDTO(Matches match) {
        MatchDTO dto = new MatchDTO();
        dto.setId(match.getId());
        dto.setDateOfMatch(match.getDateOfMatch());
        dto.setReferee(match.getReferee());
        dto.setStatut(match.getStatus());
        dto.setType(match.getType());

        if (match.getStade() != null) {
            dto.setStadeId(match.getStade().getId());
        }

        return dto;
    }

    private StadeDTO convertStadeToDTO(Stades st) {
        StadeDTO dto = new StadeDTO();
        dto.setId(st.getId());
        dto.setAdresse(st.getAdresse());
        dto.setCapacity(st.getCapacity());
        dto.setCityId(st.getCity().getId());
        dto.setCountry(st.getCountry());
        dto.setImageUrl(st.getImageUrl());
        dto.setResponsableId(st.getResponsable().getId());
        dto.setDateOfConstruction(st.getDateOfConstruction());
        dto.setName(st.getName());
        dto.setVideoUrl(st.getVideoUrl());

        return dto;
    }

    private CultureDTO convertCultureToDTO(Cultures cc) {
        CultureDTO dto = new CultureDTO();
        dto.setId(cc.getId());
        dto.setTitle(cc.getTitle());
        dto.setAuthor(cc.getAuthor());
        dto.setDescription(cc.getDescription());
        dto.setImageUrl(cc.getImageUrl());
        dto.setDateOfCreation(cc.getDateOfCreation());

        return dto;
    }

    private NewsDTO convertNewsToDTO(News neew) {
        NewsDTO dto = new NewsDTO();
        dto.setId(neew.getId());
        dto.setTitle(neew.getTitle());
        dto.setAuthor(neew.getAuthor());
        dto.setDescription(neew.getDescription());
        dto.setImageUrl(neew.getImageUrl());
        dto.setDateOfCreation(neew.getDateOfCreation());
        dto.setTeamId(neew.getTeam().getId());

        return dto;
    }

    private EventDTO convertEventToDTO(Events neew) {
        EventDTO dto = new EventDTO();
        dto.setId(neew.getId());
        dto.setCityId(neew.getCity().getId());
        dto.setDateOfEvent(neew.getDateOfEvent());
        dto.setDescription(neew.getDescription());
        dto.setImageUrl(neew.getImageUrl());
        dto.setPriceProxim(neew.getPriceProxim());
        dto.setName(neew.getName());

        return dto;
    }

    private TeamDTO convertTeamToDTO(Teams team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setCoach(team.getCoach());
        dto.setCountry(team.getCountry());
        dto.setImageUrl(team.getImageUrl());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setParticipation(team.getParticipation());

        return dto;
    }

    private GroupDTO convertGroupToDTO(Groups neew) {
        GroupDTO dto = new GroupDTO();
        dto.setId(neew.getId());
        dto.setName(neew.getName());

        return dto;
    }

}
