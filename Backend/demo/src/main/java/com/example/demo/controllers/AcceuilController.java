package com.example.demo.controllers;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
import com.example.demo.models.CityHost;
import com.example.demo.models.Culture;
import com.example.demo.models.Event;
import com.example.demo.models.Group;
import com.example.demo.models.GroupTeam;
import com.example.demo.models.Match;
import com.example.demo.models.News;
import com.example.demo.models.Stade;
import com.example.demo.models.Team;

import com.example.demo.repositories.NewsRepository;

import com.example.demo.repositories.CityHostRepository;
import com.example.demo.repositories.CultureRepository;
import com.example.demo.repositories.EventRepository;
import com.example.demo.repositories.GroupRepository;
import com.example.demo.repositories.MatchRepository;
import com.example.demo.repositories.MatchTeamRepository;
import com.example.demo.repositories.StadeRepository;
import com.example.demo.repositories.TeamRepository;

import ch.qos.logback.core.util.Duration;

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
        List<CityHost> city = CityHostRepository.findAll();
        List<CityHostDTO> cities = city.stream().map(this::convertCityToDTO).collect(Collectors.toList());
        if (cities == null) {
            return null;
        } else {
            return cities;
        }
    }

    @GetMapping("/stade/all")
    public List<StadeDTO> getAllStades() {
        List<Stade> st = StadeRepository.findAll();
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
        List<Group> groups = GroupeRepository.findAll();

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
        List<Event> event = EventRepository.findAll();

        return event.stream()
                .sorted(Comparator.comparing(Event::getDateOfEvent).reversed())
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
        List<Culture> cul = cultureRepository.findAll();

        return cul.stream()
                .sorted(Comparator.comparing(Culture::getDateOfCreation).reversed())
                .limit(7)
                .map(this::convertCultureToDTO)
                .collect(Collectors.toList());
    }

    //// some teams
    @GetMapping("/teams/some")
    public List<TeamDTO> getSomeTeams() {
        List<Team> teams = TeamRepository.findAll();

        return teams.stream().limit(4).map(this::convertTeamToDTO).collect(Collectors.toList());
    }

    @GetMapping("/matches/upcoming")
    public List<MatchDTO> getUpcomingMatches() {
        LocalDateTime now = LocalDateTime.now();
        List<Match> matches = matchRepo.findAll();

        return matches.stream()
                .filter(match -> match.getDateOfMatch().isAfter(now))
                .sorted(Comparator.comparing(Match::getDateOfMatch))
                .limit(4).map(this::convertToDTO).collect(Collectors.toList());
    }

    ///////////////////////////////////////////
    public CityHostDTO convertCityToDTO(CityHost city) {
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

    private MatchDTO convertToDTO(Match match) {
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

    private StadeDTO convertStadeToDTO(Stade st) {
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

    private CultureDTO convertCultureToDTO(Culture cc) {
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

        return dto;
    }

    private EventDTO convertEventToDTO(Event neew) {
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

    private TeamDTO convertTeamToDTO(Team team) {
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

    private GroupDTO convertGroupToDTO(Group neew) {
        GroupDTO dto = new GroupDTO();
        dto.setId(neew.getId());
        dto.setName(neew.getName());

        return dto;
    }

}
