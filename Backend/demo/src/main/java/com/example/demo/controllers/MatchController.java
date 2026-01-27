package com.example.demo.controllers;

import com.example.demo.repositories.MatchRepository;
import com.example.demo.repositories.StadeRepository;
import com.example.demo.repositories.MatchTeamRepository;

import java.sql.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.hooks.MatchDTO;
import com.example.demo.hooks.TeamDTO;
import com.example.demo.models.Match;
import com.example.demo.models.MatchTeam;
import com.example.demo.models.Stade;
import com.example.demo.models.Team;

import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/matches")
public class MatchController {
    @Autowired
    private StadeRepository StadeRepository;
    @Autowired
    private MatchRepository matchRepo;
    @Autowired
    private MatchTeamRepository MatchTeamRepository;
    @Autowired
    private PlayerController PlayerController;

    public MatchController(MatchRepository m, StadeRepository st, MatchTeamRepository mm) {
        this.matchRepo = m;
        this.StadeRepository = st;
        this.MatchTeamRepository = mm;
    }

    // all matches in the competition
    @GetMapping("/matches/all")
    public List<MatchDTO> getAllMatches() {
        List<Match> m = matchRepo.findAll();
        List<MatchDTO> matches = m.stream().map(this::convertToDTO).collect(Collectors.toList());
        if (matches == null) {
            return null;
        } else {
            return matches;
        }
    }

    // matches by groupe
    @GetMapping("/matches/groupe/{id}")
    public List<MatchDTO> getMatchesOfGroup(@PathVariable int id) {
        List<MatchDTO> m = matchRepo.findMatchesByGroupeId(id).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return m;
    }

    // getMatch By iD
    @GetMapping("/matches/{id}")
    public MatchDTO getMatche(@PathVariable int id) {
        Match match = matchRepo.findById(id);
        if (match != null) {
            return convertToDTO(match);
        } else {
            return null;
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
    public List<MatchDTO> getMatcheByDate(@PathVariable Date datee) {
        List<Match> matchs = matchRepo.findAll();
        List<MatchDTO> matches = matchs.stream()
                .filter(match -> match.getDateOfMatch().toLocalDate().equals(datee))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        if (matches == null) {
            return null;
        } else {
            return matches;
        }
    }

    // find matches in a stade
    @GetMapping("/matches/stade/{id}")
    public List<MatchDTO> getMatcheByStade(@PathVariable int id) {
        Stade st = StadeRepository.findById(id);
        if (st == null) {
            return null;
        } else {
            List<MatchDTO> matches = st.getMatches().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return matches;
        }
    }

    // delete match
    @DeleteMapping("/matches/delete/{id}")
    public boolean deleteMatch(@PathVariable int id) {
        Match m = matchRepo.findById(id);
        if (m == null) {
            return false;
        } else {
            matchRepo.deleteById(id);
            return true;
        }
    }

    @PutMapping("matches/update/{id}")
    public void updateMatche(@PathVariable int id, @RequestBody Match m) {
        Match ma = matchRepo.findById(id);
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
    public boolean addMatch(@RequestBody Match m) {
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
        Match m = matchRepo.findById(id);
        if (m == null) {
            return null;
        } else {
            List<MatchTeam> mt = MatchTeamRepository.findByMatchId(id);
            Team winner = null;
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
