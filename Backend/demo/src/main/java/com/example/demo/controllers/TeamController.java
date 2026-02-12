package com.example.demo.controllers;

import com.example.demo.repositories.MatchRepository;
import com.example.demo.repositories.StadeRepository;
import com.example.demo.repositories.TeamRepository;
import com.example.demo.repositories.MatchTeamRepository;

import java.util.List;

import java.util.stream.Collectors;
import com.example.demo.hooks.NewsDTO;
import com.example.demo.hooks.CultureDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.hooks.PlayerDTO;
import com.example.demo.hooks.TeamDTO;
import com.example.demo.models.Matches;
import com.example.demo.models.News;
import com.example.demo.models.Cultures;

import com.example.demo.models.Players;

import com.example.demo.models.Teams;

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
        List<Teams> t = TeamRepository.findAll();
        List<TeamDTO> teams = t.stream().map(this::convertTeamToDTO).collect(Collectors.toList());
        if (teams == null) {
            return null;
        } else {
            return teams;
        }
    }

    @DeleteMapping("/teams/delete/{id}")
    public boolean deleteTeam(@PathVariable int id) {
        Teams mm = TeamRepository.findById(id).orElse(null);
        if (mm == null) {
            return false;
        } else {
            TeamRepository.deleteById(id);
            return true;
        }
    }

    @GetMapping("/teams/{id}")
    public TeamDTO getTeamById(@PathVariable int id) {
        Teams team = TeamRepository.findById(id).orElse(null);

        if (team == null) {
            return null;
        } else {
            return convertTeamToDTO(team);
        }
    }

    @GetMapping("/teams/plyers/{id}")
    public List<PlayerDTO> getAllPlayersTeam(@PathVariable int id) {

        Teams t = TeamRepository.findById(id).orElse(null);
        if (t == null) {
            return null;
        } else {
            return t.getPlayers().stream().map(this::convertPlayerToDTO)
                    .collect(Collectors.toList());
        }

    }

    @GetMapping("/teams/news/{id}")
    public List<NewsDTO> getAllNewsTeam(@PathVariable int id) {

        Teams t = TeamRepository.findById(id).orElse(null);
        if (t == null) {
            return null;
        } else {
            return t.getNews().stream().map(this::convertNewsToDTO)
                    .collect(Collectors.toList());
        }

    }

    @GetMapping("/teams/contenuCultirel/{id}")
    public List<CultureDTO> getAllCulturelTeam(@PathVariable int id) {

        Teams t = TeamRepository.findById(id).orElse(null);
        if (t == null) {
            return null;
        } else {
            return t.getCultures().stream().map(this::convertCultureToDTO)
                    .collect(Collectors.toList());
        }

    }

    // add team
    @PostMapping("/team/add")
    public boolean addMatch(@RequestBody Teams m) {
        if (m == null) {
            return false;
        } else {
            TeamRepository.save(m);
            return true;
        }
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
}
