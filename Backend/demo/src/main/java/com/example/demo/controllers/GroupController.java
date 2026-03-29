package com.example.demo.controllers;

import com.example.demo.models.Groups;
import com.example.demo.models.GroupTeam;
import com.example.demo.models.Teams;
import com.example.demo.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    @Autowired
    private GroupRepository groupsRepository;

    @Autowired
    private GroupTeamRepository groupTeamRepository;

    @Autowired
    private TeamRepository teamsRepository;

    // ===== DTOs =====

    public static class GroupDTO {
        private int id;
        private String name;
        private List<GroupTeamDTO> groupTeams;

        public GroupDTO() {
        }

        public GroupDTO(Groups group) {
            this.id = group.getId();
            this.name = group.getName();
            if (group.getGroupTeams() != null) {
                this.groupTeams = group.getGroupTeams().stream()
                        .map(GroupTeamDTO::new)
                        .collect(Collectors.toList());
            }
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public List<GroupTeamDTO> getGroupTeams() {
            return groupTeams;
        }

        public void setGroupTeams(List<GroupTeamDTO> groupTeams) {
            this.groupTeams = groupTeams;
        }
    }

    public static class GroupTeamDTO {
        private int id;
        private int wins;
        private int draws;
        private int loses;
        private int goalsScored;
        private int goalsConceded;
        private int teamID;
        private String teamName;
        private String teamCountry;
        private String teamImageUrl;

        public GroupTeamDTO() {
        }

        public GroupTeamDTO(GroupTeam groupTeam) {
            this.id = groupTeam.getId();
            this.wins = groupTeam.getWins();
            this.draws = groupTeam.getDraws();
            this.loses = groupTeam.getLoses();
            this.goalsScored = groupTeam.getGoalsScored();
            this.goalsConceded = groupTeam.getGoalsConceded();
            if (groupTeam.getTeam() != null) {
                this.teamID = groupTeam.getTeam().getId();
                this.teamName = groupTeam.getTeam().getName();
                this.teamCountry = groupTeam.getTeam().getCountry();
                this.teamImageUrl = groupTeam.getTeam().getImageUrl();
            }
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public int getWins() {
            return wins;
        }

        public void setWins(int wins) {
            this.wins = wins;
        }

        public int getDraws() {
            return draws;
        }

        public void setDraws(int draws) {
            this.draws = draws;
        }

        public int getLoses() {
            return loses;
        }

        public void setLoses(int loses) {
            this.loses = loses;
        }

        public int getGoalsScored() {
            return goalsScored;
        }

        public void setGoalsScored(int goalsScored) {
            this.goalsScored = goalsScored;
        }

        public int getGoalsConceded() {
            return goalsConceded;
        }

        public void setGoalsConceded(int goalsConceded) {
            this.goalsConceded = goalsConceded;
        }

        public int getTeamID() {
            return teamID;
        }

        public void setTeamID(int teamID) {
            this.teamID = teamID;
        }

        public String getTeamName() {
            return teamName;
        }

        public void setTeamName(String teamName) {
            this.teamName = teamName;
        }

        public String getTeamCountry() {
            return teamCountry;
        }

        public void setTeamCountry(String teamCountry) {
            this.teamCountry = teamCountry;
        }

        public String getTeamImageUrl() {
            return teamImageUrl;
        }

        public void setTeamImageUrl(String teamImageUrl) {
            this.teamImageUrl = teamImageUrl;
        }
    }

    public static class CreateGroupDTO {
        private String name;
        private List<CreateGroupTeamDTO> groupTeams;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public List<CreateGroupTeamDTO> getGroupTeams() {
            return groupTeams;
        }

        public void setGroupTeams(List<CreateGroupTeamDTO> groupTeams) {
            this.groupTeams = groupTeams;
        }
    }

    public static class CreateGroupTeamDTO {
        private int wins;
        private int draws;
        private int loses;
        private int goalsScored;
        private int goalsConceded;
        private int teamID;

        public int getWins() {
            return wins;
        }

        public void setWins(int wins) {
            this.wins = wins;
        }

        public int getDraws() {
            return draws;
        }

        public void setDraws(int draws) {
            this.draws = draws;
        }

        public int getLoses() {
            return loses;
        }

        public void setLoses(int loses) {
            this.loses = loses;
        }

        public int getGoalsScored() {
            return goalsScored;
        }

        public void setGoalsScored(int goalsScored) {
            this.goalsScored = goalsScored;
        }

        public int getGoalsConceded() {
            return goalsConceded;
        }

        public void setGoalsConceded(int goalsConceded) {
            this.goalsConceded = goalsConceded;
        }

        public int getTeamID() {
            return teamID;
        }

        public void setTeamID(int teamID) {
            this.teamID = teamID;
        }
    }

    // ===== ENDPOINTS =====

    @GetMapping("/getAll")
    public ResponseEntity<List<GroupDTO>> getAllGroups() {
        try {
            List<Groups> groups = groupsRepository.findAll();
            List<GroupDTO> groupDTOs = groups.stream()
                    .map(GroupDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(groupDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/getOne/{id}")
    public ResponseEntity<GroupDTO> getGroupById(@PathVariable int id) {
        try {
            Optional<Groups> groupOptional = groupsRepository.findById(id);
            if (groupOptional.isPresent()) {
                GroupDTO groupDTO = new GroupDTO(groupOptional.get());
                return ResponseEntity.ok(groupDTO);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<GroupDTO> createGroup(@RequestBody CreateGroupDTO createGroupDTO) {
        try {
            // Créer le groupe
            Groups group = new Groups();
            group.setName(createGroupDTO.getName());

            // Sauvegarder le groupe d'abord
            Groups savedGroup = groupsRepository.save(group);

            // Créer les GroupTeams
            List<GroupTeam> groupTeams = new ArrayList<>();
            if (createGroupDTO.getGroupTeams() != null) {
                for (CreateGroupTeamDTO gtDto : createGroupDTO.getGroupTeams()) {
                    Optional<Teams> teamOptional = teamsRepository.findById(gtDto.getTeamID());
                    if (teamOptional.isPresent()) {
                        GroupTeam groupTeam = new GroupTeam();
                        groupTeam.setWins(gtDto.getWins());
                        groupTeam.setDraws(gtDto.getDraws());
                        groupTeam.setLoses(gtDto.getLoses());
                        groupTeam.setGoalsScored(gtDto.getGoalsScored());
                        groupTeam.setGoalsConceded(gtDto.getGoalsConceded());
                        groupTeam.setGroup(savedGroup);
                        groupTeam.setTeam(teamOptional.get());
                        groupTeams.add(groupTeam);
                    }
                }
            }

            // Sauvegarder les GroupTeams
            groupTeamRepository.saveAll(groupTeams);
            savedGroup.setGroupTeams(groupTeams);

            GroupDTO groupDTO = new GroupDTO(savedGroup);
            return ResponseEntity.status(HttpStatus.CREATED).body(groupDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Transactional
    @PutMapping("/update/{id}")
    public ResponseEntity<GroupDTO> updateGroup(@PathVariable int id, @RequestBody CreateGroupDTO updateGroupDTO) {
        try {
            Optional<Groups> groupOptional = groupsRepository.findById(id);
            if (!groupOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Groups group = groupOptional.get();
            group.setName(updateGroupDTO.getName());

            // ✅ Vider la collection EN PLACE (pas de setGroupTeams avec new ArrayList) 
            group.getGroupTeams().clear();

            // ✅ Construire et ajouter les nouveaux GroupTeams directement dans la collection
            if (updateGroupDTO.getGroupTeams() != null) {
                for (CreateGroupTeamDTO gtDto : updateGroupDTO.getGroupTeams()) {
                    Optional<Teams> teamOptional = teamsRepository.findById(gtDto.getTeamID());
                    if (teamOptional.isPresent()) {
                        GroupTeam groupTeam = new GroupTeam();
                        groupTeam.setWins(gtDto.getWins());
                        groupTeam.setDraws(gtDto.getDraws());
                        groupTeam.setLoses(gtDto.getLoses());
                        groupTeam.setGoalsScored(gtDto.getGoalsScored());
                        groupTeam.setGoalsConceded(gtDto.getGoalsConceded());
                        groupTeam.setGroup(group);
                        groupTeam.setTeam(teamOptional.get());
                        // ✅ Ajouter dans la collection existante, pas dans une nouvelle liste
                        group.getGroupTeams().add(groupTeam);
                    }
                }
            }

            // ✅ Plus besoin de saveAll ni de setGroupTeams — cascade gère tout
            Groups updatedGroup = groupsRepository.save(group);
            return ResponseEntity.ok(new GroupDTO(updatedGroup));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable int id) {
        try {
            Optional<Groups> groupOptional = groupsRepository.findById(id);
            if (!groupOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            groupsRepository.deleteById(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}