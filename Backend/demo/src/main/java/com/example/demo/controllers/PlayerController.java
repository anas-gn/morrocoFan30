package com.example.demo.controllers;

import com.example.demo.repositories.PlayerRepository;
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

import com.example.demo.hooks.PlayerDTO;

import com.example.demo.models.Player;

import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    public PlayerController(PlayerRepository p) {

        this.playerRepository = p;

    }

    @GetMapping("/players/all")
    public List<PlayerDTO> getAllPlayers() {
        List<Player> p = playerRepository.findAll();
        List<PlayerDTO> players = p.stream().map(this::convertPlayerToDTO).collect(Collectors.toList());
        if (players == null) {
            return null;
        } else {
            return players;
        }
    }

    @GetMapping("/players/{id}")
    public PlayerDTO getPlayer(@PathVariable int id) {
        Player p = playerRepository.findById(id);
        if (p == null) {
            return null;
        } else {
            return convertPlayerToDTO(p);
        }
    }

    @DeleteMapping("/players/{id}")
    public boolean DeletePlayer(@PathVariable int id) {
        Player p = playerRepository.findById(id);
        if (p == null) {
            return false;
        } else {
            playerRepository.delete(p);
            return true;
        }
    }

    @PostMapping("players/add/")
    public boolean addPlayer(@RequestBody Player pp) {
        if (pp == null) {
            return false;
        } else {
            playerRepository.save(pp);
            return true;
        }
    }

    @PutMapping("/players/update/{id}")
    public boolean updatePlayer(@PathVariable int id, @RequestBody Player pp) {
        Player p = playerRepository.findById(id);
        if (p == null) {
            return false;
        } else {
            p.setGoals(pp.getGoals());
            p.setHeight(pp.getHeight());
            p.setWeight(pp.getWeight());
            p.setName(pp.getName());
            p.setTeam(pp.getTeam());
            p.setT(pp.getT());
            playerRepository.save(p);
            return true;

        }

    }

    @PutMapping("/players/addgoal/{id}")
    public boolean addGoal(@PathVariable int id) {
        Player p = playerRepository.findById(id);
        if (p == null) {
            return false;
        } else {
            p.setGoals(p.getGoals() + 1);
            playerRepository.save(p);
            return true;
        }
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

}
