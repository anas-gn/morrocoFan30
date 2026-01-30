package com.example.demo.controllers;

import com.example.demo.repositories.MatchRepository;
import com.example.demo.repositories.StadeRepository;
import com.example.demo.repositories.MatchTeamRepository;

import java.time.LocalDate;
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
import com.example.demo.hooks.TeamDTO;
import com.example.demo.models.Matches;
import com.example.demo.models.MatchTeam;
import com.example.demo.models.Stades;
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
    private PlayerController PlayerController;

    public MatchesController(MatchRepository m, StadeRepository st, MatchTeamRepository mm) {
        this.matchRepo = m;
        this.StadeRepository = st;
        this.MatchTeamRepository = mm;
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

    // getMatch By iD
    @GetMapping("/matches/{id}")
    public MatchDTO getMatche(@PathVariable int id) {
        Matches match = matchRepo.findById(id);

        if (match == null) {
            return null;
        } else {
            return convertToDTO(match);
        }

    }

    @PutMapping("/matches/{id}/team/{idT}/player/{idP}")
    public void PlayerScoredInMatch(@PathVariable("id") int id, @PathVariable("idT") int idT,
            @PathVariable("idP") int idP) {
        PlayerController.addGoal(idP);
        MatchTeam mt = MatchTeamRepository.findByMatchIdAndTeamId(id, idT);
        mt.setGoals(mt.getGoals() + 1);
        MatchTeamRepository.save(mt);
    }

    // matches by Date
    @GetMapping("/matches/getdate")
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

    // find matches in a stade
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

    // matche winner
    @GetMapping("/matches/winner/{id}")
    public TeamDTO getMatcheWinner(@PathVariable int id) {
        Matches m = matchRepo.findById(id);
        if (m == null) {
            return null;
        } else {
            List<MatchTeam> mt = MatchTeamRepository.findByMatchId(id);
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
            return convertTeamToDTO(winner);
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
}
