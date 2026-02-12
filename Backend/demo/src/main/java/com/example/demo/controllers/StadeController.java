package com.example.demo.controllers;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.demo.repositories.ImageRepository;
import com.example.demo.repositories.StadeRepository;
import com.example.demo.repositories.MatchTeamRepository;

import java.time.LocalDateTime;
import java.util.List;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.PageRequest;

import com.example.demo.hooks.ImageDTO;
import com.example.demo.hooks.MatchDTO;
import com.example.demo.hooks.MatchTeamDTO;
import com.example.demo.hooks.StadeDTO;
import com.example.demo.models.Matches;
import com.example.demo.models.Images;
import com.example.demo.models.MatchTeam;
import com.example.demo.models.Stades;

@RestController
@RequestMapping("/api/stade")
public class StadeController {
    @Autowired
    private StadeRepository StadeRepository;
    @Autowired
    private MatchTeamRepository MatchTeamRepository;
    @Autowired
    private ImageRepository ImageRepository;

    public StadeController(ImageRepository ImageRepository, StadeRepository st, MatchTeamRepository mm) {
        this.ImageRepository = ImageRepository;
        this.StadeRepository = st;
        this.MatchTeamRepository = mm;
    }

    ///////////// all stades
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

    /////////// stade by name
    @GetMapping("/stade/byName/{name}")
    public StadeDTO getStadeByName(@PathVariable String name) {
        Stades st = StadeRepository.findByName(name);
        return convertStadeToDTO(st);

    }

    /////////// stade by city
    @GetMapping("/stade/byCity/{cityId}")
    public List<StadeDTO> getStadesByCity(@PathVariable int cityId) {
        List<Stades> stades = StadeRepository.findByCityHostId(cityId);
        return stades.stream()
                .map(this::convertStadeToDTO)
                .collect(Collectors.toList());
    }

    ///// les matches d'un stade
    @GetMapping("/stade/matches/{id}")
    public List<MatchDTO> getMatcheByStade(@PathVariable int id) {
        Stades st = StadeRepository.findById(id);

        if (st == null) {
            return null;
        } else {
            List<Matches> matches = st.getMatches();
            return matches.stream().map(this::convertToDTO).collect(Collectors.toList());

        }

    }

    // Obtenir les prochains matches d'un stade
    @GetMapping("/stade/{id}/upcomingMatches")
    public List<MatchDTO> getUpcomingMatches(@PathVariable int id) {
        Stades stade = StadeRepository.findById(id);
        if (stade == null)
            return null;

        LocalDateTime today = LocalDateTime.now();
        return stade.getMatches().stream()
                .filter(m -> m.getDateOfMatch().isAfter(today))
                .sorted((m1, m2) -> m1.getDateOfMatch().compareTo(m2.getDateOfMatch()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    ///////////// get Stade by id
    @GetMapping("/stade/{id}")
    public StadeDTO getStadesById(@PathVariable int id) {
        Stades stade = StadeRepository.findById(id);
        if (stade == null) {
            return null;
        } else {
            return convertStadeToDTO(stade);
        }

    }

    ///////////// get stade images
    @GetMapping("/images/stade/{stadeId}")
    public List<ImageDTO> getStadeImages(@PathVariable int stadeId) {
        List<Images> images = ImageRepository.findByTypeAndOwnerID("stade", stadeId);
        return images.stream()
                .map(this::convertImageToDTO)
                .collect(Collectors.toList());
    }

    /////////////////////////////////////////////// admin

    //////////// delete stade
    @DeleteMapping("/stade/delete/{id}")
    public boolean deleteStade(@PathVariable int id) {
        Stades m = StadeRepository.findById(id);
        if (m == null) {
            return false;
        } else {
            StadeRepository.deleteById(id);
            return true;
        }
    }

    //// modifier stade
    @PutMapping("stade/update/{id}")
    public void updateStade(@PathVariable int id, @RequestBody Stades m) {
        Stades ma = StadeRepository.findById(id);
        if (ma != null) {
            ma.setName(m.getName());
            ma.setCapacity(m.getCapacity());
            ma.setCountry(m.getCountry());
            ma.setDescription(m.getDescription());
            ma.setVideoUrl(m.getVideoUrl());
            ma.setImageUrl(m.getImageUrl());
            ma.setAdresse(m.getAdresse());
            ma.setDateOfConstruction(m.getDateOfConstruction());
            ma.setMatches(ma.getMatches());
            ma.setCity(m.getCity());
            ma.setResponsable(m.getResponsable());
            StadeRepository.save(ma);
        }
    }

    // add match
    @PostMapping("/stade/add")
    public boolean addStade(@RequestBody Stades m) {
        if (m == null) {
            return false;
        } else {
            StadeRepository.save(m);
            return true;
        }
    }

    //////////////////////////////// /////////////////// statistiques

    /// // Nombre total de stades
    @GetMapping("/stade/count")
    public long getStadesCount() {
        return StadeRepository.count();
    }

    // Stades les plus grands (top 5 par capacité)
    @GetMapping("/stade/top/capacity")
    public List<StadeDTO> getTopStadesByCapacity(
            @RequestParam(defaultValue = "5") int limit) {

        Pageable topFive = PageRequest.of(0, 5);
        List<Stades> stades = StadeRepository.findByOrderByCapacityDesc(topFive);

        return stades.stream()
                .map(this::convertStadeToDTO)
                .collect(Collectors.toList());
    }

    ///////////// ///////////////////////////////////////////convertion
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

    private ImageDTO convertImageToDTO(Images image) {
        return new ImageDTO(
                image.getId(),
                image.getImageUrl(),
                image.getType(),
                image.getOwnerID());
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
        dto.setReferee(match.getReferee());


        return dto;
    }

    private MatchTeamDTO convertMatchTeamToDTO(MatchTeam cc) {
        MatchTeamDTO mt = new MatchTeamDTO();
        mt.setId(cc.getId());
        mt.setMatchId(cc.getMatch().getId());
        mt.setTeamId(cc.getTeam().getId());
        mt.setGoals(cc.getGoals());
        mt.setTeamName(cc.getTeam().getName());
        mt.setImageUrl(cc.getTeam().getImageUrl());
        mt.setPosition(cc.getPosition());
        return mt;

    }

    private List<MatchTeamDTO> convertMatchTeamToDTO(List<MatchTeam> cc) {

        return cc.stream()
                .map(this::convertMatchTeamToDTO)
                .collect(Collectors.toList());

    }
}