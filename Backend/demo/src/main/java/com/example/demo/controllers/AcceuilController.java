package com.example.demo.controllers;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.demo.hooks.CityHostDTO;
import com.example.demo.hooks.MatchDTO;
import com.example.demo.hooks.StadeDTO;
import com.example.demo.hooks.TeamDTO;
import com.example.demo.models.CityHost;
import com.example.demo.models.Match;
import com.example.demo.models.Stade;
import com.example.demo.models.Team;
import com.example.demo.repositories.CityHostRepository;
import com.example.demo.repositories.GroupRepository;
import com.example.demo.repositories.MatchRepository;
import com.example.demo.repositories.MatchTeamRepository;
import com.example.demo.repositories.StadeRepository;
import com.example.demo.repositories.TeamRepository;

import ch.qos.logback.core.util.Duration;

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

    public AcceuilController(TeamRepository teamRepository,
            StadeRepository stadeRepository, MatchRepository matchRepo,
            MatchTeamRepository matchTeamRepository, GroupRepository groupeRepository,
            CityHostRepository cityHostRepository) {
        TeamRepository = teamRepository;
        StadeRepository = stadeRepository;
        this.matchRepo = matchRepo;
        MatchTeamRepository = matchTeamRepository;
        GroupeRepository = groupeRepository;
        CityHostRepository = cityHostRepository;
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

    @GetMapping("/matches/upcoming")
    public List<MatchDTO> getUpcomingMatches() {
        LocalDateTime now = LocalDateTime.now();
        List<Match> matches = matchRepo.findAll();

        return matches.stream()
                .filter(match -> match.getDateOfMatch().isAfter(now))
                .sorted(Comparator.comparing(Match::getDateOfMatch))
                .limit(4).map(this::convertToDTO).collect(Collectors.toList());
    }

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

}
