package com.example.demo.controllers;

import java.time.Duration;
import java.time.LocalDateTime;

import java.util.Comparator;

import java.util.List;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.hooks.CityHostDTO;
import com.example.demo.hooks.CultureDTO;
import com.example.demo.hooks.MatchTeamDTO;
import com.example.demo.hooks.EventDTO;
import com.example.demo.hooks.GroupDTO;
import com.example.demo.hooks.GroupTeamDTO;
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

    /////////// les cartes des villes
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

    /////////////// les stades
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

    //////// les groupes
    @GetMapping("/accueil/groupes")
    public List<GroupDTO> getAllStandings() {
        List<Groups> grp = GroupeRepository.findAll();
        List<GroupDTO> groupes = grp.stream().map(this::convertGroupToDTO).collect(Collectors.toList());
        return groupes;
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
    public List<MatchDTO> getUpcomingMatches() {
        LocalDateTime now = LocalDateTime.now();

        return matchRepo.findAll().stream()

                .sorted(Comparator.comparing(
                        m -> Math.abs(Duration.between(now, m.getDateOfMatch()).toMinutes())))

                .limit(6)

                .sorted(Comparator.comparing(Matches::getDateOfMatch))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /////////////////////////////////////////// Converts
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
        List<MatchTeam> mt = MatchTeamRepository.findByMatchId(match.getId());
        dto.setId(match.getId());
        dto.setDateOfMatch(match.getDateOfMatch());
        dto.setReferee(match.getReferee());
        dto.setStatut(match.getStatus());
        dto.setType(match.getType());
        dto.setTreeId(match.getTreeID());
        dto.setMatchTeams(convertMatchTeamToDTO(mt));
        if (match.getStade() != null) {
            dto.setStadeId(match.getStade().getId());
        }
        dto.setStadeName(match.getStade().getName());

        return dto;
    }

    private MatchTeamDTO convertMatchTeamToDTO(MatchTeam cc) {
        MatchTeamDTO mt = new MatchTeamDTO();
        mt.setId(cc.getId());
        mt.setMatchId(cc.getMatch().getId());
        mt.setTeamId(cc.getTeam().getId());
        mt.setGoals(cc.getGoals());
        mt.setTeamName(cc.getTeam().getName());
        return mt;

    }

    private List<MatchTeamDTO> convertMatchTeamToDTO(List<MatchTeam> cc) {

        return cc.stream()
                .map(this::convertMatchTeamToDTO)
                .collect(Collectors.toList());

    }

    private StadeDTO convertStadeToDTO(Stades st) {
        StadeDTO dto = new StadeDTO();
        dto.setId(st.getId());
        dto.setDescription(st.getDescription());
        dto.setAdresse(st.getAdresse());
        dto.setCapacity(st.getCapacity());
        dto.setCityId(st.getCity().getId());
        dto.setCountry(st.getCountry());
        dto.setImageUrl(st.getImageUrl());
        dto.setResponsableId(st.getResponsable().getId());
        dto.setDateOfConstruction(st.getDateOfConstruction());
        dto.setName(st.getName());
        dto.setCityName(st.getCity().getName());
        dto.setResponsable(st.getResponsable().getName());
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
        dto.setTeamName(neew.getTeam().getName());

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
        dto.setCityName(neew.getCity().getName());

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

    private GroupTeamDTO convertGroupTeamToDTO(GroupTeam neew) {
        GroupTeamDTO dto = new GroupTeamDTO();
        dto.setId(neew.getId());
        dto.setDraws(neew.getDraws());
        dto.setGoalsScored(neew.getGoalsScored());
        dto.setLoses(neew.getLoses());
        dto.setTeamID(neew.getTeam().getId());
        dto.setGoalsConceded(neew.getGoalsConceded());
        dto.setTeamCountry(neew.getTeam().getCountry());
        dto.setWins(neew.getWins());
        dto.setTeamImageUrl(neew.getTeam().getImageUrl());
        dto.setTeamName(neew.getTeam().getName());
        return dto;
    }

    private GroupDTO convertGroupToDTO(Groups neew) {
        GroupDTO dto = new GroupDTO();
        dto.setId(neew.getId());
        dto.setName(neew.getName());
        dto.setGroupTeams(convertGroupTeamToDTO(neew.getGroupTeams()));
        return dto;
    }

    private List<GroupTeamDTO> convertGroupTeamToDTO(List<GroupTeam> groupTeams) {
        return groupTeams.stream()
                .map(this::convertGroupTeamToDTO)
                .collect(Collectors.toList());
    }

}
