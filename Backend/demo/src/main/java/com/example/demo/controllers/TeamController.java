package com.example.demo.controllers;

import com.example.demo.repositories.MatchRepository;
import com.example.demo.repositories.StadeRepository;
import com.example.demo.repositories.TeamRepository;
import com.example.demo.repositories.MatchTeamRepository;

import java.sql.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.example.demo.hooks.NewsDTO;
import com.example.demo.hooks.CulturelContentDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.hooks.MatchDTO;
import com.example.demo.hooks.PlayerDTO;
import com.example.demo.hooks.TeamDTO;
import com.example.demo.models.Match;
import com.example.demo.models.News;
import com.example.demo.models.CulturelContent;
import com.example.demo.models.MatchTeam;
import com.example.demo.models.Player;
import com.example.demo.models.Stade;
import com.example.demo.models.Team;

import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/teams")
public class TeamController {
    @Autowired
    private TeamRepository TeamRepository;
    @Autowired
    private StadeRepository StadeRepository;
    @Autowired
    private MatchRepository matchRepo;
    @Autowired
    private MatchTeamRepository MatchTeamRepository;

    public TeamController(MatchRepository m, StadeRepository st, MatchTeamRepository mm, TeamRepository tt) {
        this.matchRepo = m;
        this.StadeRepository = st;
        this.MatchTeamRepository = mm;
        this.TeamRepository = tt;
    }

    // all teams in the competition
    @GetMapping("/teams/all")
    public List<TeamDTO> gatAllTeam() {
        List<Team> t = TeamRepository.findAll();
        List<TeamDTO> teams = t.stream().map(this::convertTeamToDTO).collect(Collectors.toList());
        if (teams == null) {
            return null;
        } else {
            return teams;
        }
    }

    @GetMapping("/teams/plyers/{id}")
    public List<PlayerDTO> getAllPlayersTeam(@PathVariable int id) {

        Team t = TeamRepository.findById(id).orElse(null);
        if (t == null) {
            return null;
        } else {
            return t.getPlayers().stream().map(this::convertPlayerToDTO)
                    .collect(Collectors.toList());
        }

    }

    @GetMapping("/teams/news/{id}")
    public List<NewsDTO> getAllNewsTeam(@PathVariable int id) {

        Team t = TeamRepository.findById(id).orElse(null);
        if (t == null) {
            return null;
        } else {
            return t.getNews().stream().map(this::convertNewsToDTO)
                    .collect(Collectors.toList());
        }

    }
     @GetMapping("/teams/contenuCultirel/{id}")
    public List<CulturelContent> getAllCulturelTeam(@PathVariable int id) {

        Team t = TeamRepository.findById(id).orElse(null);
        if (t == null) {
            return null;
        } else {
            return t.getCc().stream().map(this::convertCultureToDTO)
                    .collect(Collectors.toList());
        }

    }


    private CulturelContentDTO convertNewsToDTO(CulturelContent cc) {
        CulturelContentDTO dto = new CulturelContentDTO();
        dto.setId(cc.getId());
        dto.setTitle(cc.getTitle());
        dto.setAuthor(cc.getAuthor());
        dto.setDescription(cc.getDescription());
        dto.setImage(cc.getImage());
        dto.setDateC(cc.getDateC());

        return dto;
    }


    private NewsDTO convertNewsToDTO(News neew) {
        NewsDTO dto = new NewsDTO();
        dto.setId(neew.getId());
        dto.setTitle(neew.getTitle());
        dto.setAuthor(neew.getAuthor());
        dto.setDescription(neew.getDescription());
        dto.setImage(neew.getImage());
        dto.setDateC(neew.getDateC());

        return dto;
    }

    private PlayerDTO convertPlayerToDTO(Player player) {
        PlayerDTO dto = new PlayerDTO();
        dto.setId(player.getId());
        dto.setGoals(player.getGoals());
        dto.setHeight(player.getHeight());
        dto.setTeam(player.getTeam());
        dto.setWeight(player.getWeight());
        dto.setName(player.getName());
        dto.setTeamId(player.getT().getId());

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

        return dto;
    }
}
