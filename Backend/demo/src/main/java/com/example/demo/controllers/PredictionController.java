package com.example.demo.controllers;

import com.example.demo.repositories.PredictionRepository;
import com.example.demo.repositories.MatchRepository;
import com.example.demo.repositories.SupporterRepository;
import com.example.demo.repositories.TeamRepository;
import com.example.demo.repositories.MatchTeamRepository;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.hooks.PredictionDTO;
import com.example.demo.hooks.SupporterDTO;
import com.example.demo.models.Predictions;
import com.example.demo.models.Matches;
import com.example.demo.models.Supporters;
import com.example.demo.models.Teams;
import com.example.demo.models.MatchTeam;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @Autowired
    private PredictionRepository predictionRepository;
    @Autowired
    private MatchRepository matchRepository;
    @Autowired
    private SupporterRepository supporterRepository;
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private MatchTeamRepository matchTeamRepository;

    /////////////// add prediction

    @PostMapping("/add")
    public PredictionDTO createPrediction(@RequestParam int matchId, @RequestParam int supporterId,
            @RequestParam int predictedWinnerId) {

        Matches match = matchRepository.findById(matchId);
        Supporters supporter = supporterRepository.findById(supporterId);
        Teams predictedWinner = teamRepository.findById(predictedWinnerId);
        if (match == null || supporter == null || predictedWinner == null) {
            return null;
        }
        if ("DIRECT".equalsIgnoreCase(match.getStatus()) ||
                "FINISHED".equalsIgnoreCase(match.getStatus())) {
            return null;
        }
        Predictions existingPrediction = predictionRepository.findByMatchIdAndSupporterId(matchId, supporterId);

        if (existingPrediction != null) {
            return null;
        }
        Predictions prediction = new Predictions(match, supporter, predictedWinner);
        predictionRepository.save(prediction);

        return convertToDTO(prediction);
    }

    ///// prediction d'un supporter
    @GetMapping("/supporter/{supporterId}")
    public List<PredictionDTO> getSupporterPredictions(@PathVariable int supporterId) {
        List<Predictions> predictions = predictionRepository.findBySupporterId(supporterId);
        return predictions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    ////////////////// les prediction d'un match
    @GetMapping("/match/{matchId}")
    public List<PredictionDTO> getMatchPredictions(@PathVariable int matchId) {
        List<Predictions> predictions = predictionRepository.findByMatchId(matchId);
        return predictions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /////////////////// prediction d'un supporteur dans un match
    @GetMapping("/supporter/{supporterId}/match/{matchId}")
    public PredictionDTO getSupporterMatchPrediction(
            @PathVariable int supporterId,
            @PathVariable int matchId) {
        Predictions prediction = predictionRepository
                .findByMatchIdAndSupporterId(matchId, supporterId);
        return prediction != null ? convertToDTO(prediction) : null;
    }

    //////////////////// la liste des supporteur
    @GetMapping("/leaderboard")
    public List<SupporterDTO> getLeaderboard() {
        List<Supporters> supporters = supporterRepository.findAllByOrderByTotalPointsDesc();
        return supporters.stream()
                .map(this::convertSupporterToDTO)
                .collect(Collectors.toList());
    }

    ///////////// top 10
    @GetMapping("/leaderboard/top10")
    public List<SupporterDTO> getTop10() {
        List<Supporters> supporters = supporterRepository.findAllByOrderByTotalPointsDesc();
        return supporters.stream()
                .limit(10)
                .map(this::convertSupporterToDTO)
                .collect(Collectors.toList());
    }

    ///////////////////// les stats d'un spporteur
    @GetMapping("/supporter/{id}/stats")
    public SupporterStatsDTO getSupporterStats(@PathVariable int id) {
        Supporters supporter = supporterRepository.findById(id);
        if (supporter == null) {
            return null;
        }
        List<Predictions> predictions = predictionRepository.findBySupporterId(id);
        long totalPredictions = predictions.size();
        long correctPredictions = predictions.stream()
                .filter(p -> "correct".equalsIgnoreCase(p.getStatus()))
                .count();
        long incorrectPredictions = predictions.stream()
                .filter(p -> "incorrect".equalsIgnoreCase(p.getStatus()))
                .count();
        long pendingPredictions = predictions.stream()
                .filter(p -> "pending".equalsIgnoreCase(p.getStatus()))
                .count();

        double accuracy = totalPredictions > 0
                ? (correctPredictions * 100.0) / (totalPredictions - pendingPredictions)
                : 0.0;
        SupporterStatsDTO stats = new SupporterStatsDTO();
        stats.setSupporterId(id);
        stats.setSupporterName(supporter.getName());
        stats.setTotalPoints(supporter.getTotalPoints());
        stats.setTotalPredictions(totalPredictions);
        stats.setCorrectPredictions(correctPredictions);
        stats.setIncorrectPredictions(incorrectPredictions);
        stats.setPendingPredictions(pendingPredictions);
        stats.setAccuracy(accuracy);
        return stats;
    }

    ///////////// supprimer
    @DeleteMapping("/delete/{id}")
    public boolean deletePrediction(@PathVariable int id) {
        Predictions prediction = predictionRepository.findById(id);

        if (prediction == null) {
            return false;
        }
        Matches match = prediction.getMatch();
        if ("en_cours".equalsIgnoreCase(match.getStatus()) ||
                "termine".equalsIgnoreCase(match.getStatus())) {
            return false;
        }

        predictionRepository.deleteById(id);
        return true;
    }

    ////////////////////////////// convert
    private PredictionDTO convertToDTO(Predictions prediction) {
        PredictionDTO dto = new PredictionDTO();
        dto.setId(prediction.getId());
        dto.setMatchId(prediction.getMatch().getId());
        dto.setSupporterId(prediction.getSupporter().getId());
        dto.setDateOfPrediction(prediction.getDateOfPrediction());
        dto.setPoints(prediction.getPoints());
        dto.setStatus(prediction.getStatus());
        if (prediction.getPredictedWinner() != null) {
            dto.setPredictedWinnerId(prediction.getPredictedWinner().getId());
            dto.setPredictedWinnerName(prediction.getPredictedWinner().getName());
        }
        List<MatchTeam> matchTeams = matchTeamRepository.findByMatchId(prediction.getMatch().getId());
        if (matchTeams != null && matchTeams.size() >= 2) {
            dto.setTeam1Name(matchTeams.get(0).getTeam().getName());
            dto.setTeam2Name(matchTeams.get(1).getTeam().getName());
        }

        dto.setMatchStatus(prediction.getMatch().getStatus());

        return dto;
    }

    private SupporterDTO convertSupporterToDTO(Supporters supporter) {
        SupporterDTO dto = new SupporterDTO();
        dto.setId(supporter.getId());
        dto.setName(supporter.getName());
        dto.setEmail(supporter.getEmail());
        dto.setTotalPoints(supporter.getTotalPoints());
        return dto;
    }

    /////////// classDTO
    public static class SupporterStatsDTO {
        private int supporterId;
        private String supporterName;
        private int totalPoints;
        private long totalPredictions;
        private long correctPredictions;
        private long incorrectPredictions;
        private long pendingPredictions;
        private double accuracy;

        public SupporterStatsDTO() {
        }

        public int getSupporterId() {
            return supporterId;
        }

        public void setSupporterId(int supporterId) {
            this.supporterId = supporterId;
        }

        public String getSupporterName() {
            return supporterName;
        }

        public void setSupporterName(String supporterName) {
            this.supporterName = supporterName;
        }

        public int getTotalPoints() {
            return totalPoints;
        }

        public void setTotalPoints(int totalPoints) {
            this.totalPoints = totalPoints;
        }

        public long getTotalPredictions() {
            return totalPredictions;
        }

        public void setTotalPredictions(long totalPredictions) {
            this.totalPredictions = totalPredictions;
        }

        public long getCorrectPredictions() {
            return correctPredictions;
        }

        public void setCorrectPredictions(long correctPredictions) {
            this.correctPredictions = correctPredictions;
        }

        public long getIncorrectPredictions() {
            return incorrectPredictions;
        }

        public void setIncorrectPredictions(long incorrectPredictions) {
            this.incorrectPredictions = incorrectPredictions;
        }

        public long getPendingPredictions() {
            return pendingPredictions;
        }

        public void setPendingPredictions(long pendingPredictions) {
            this.pendingPredictions = pendingPredictions;
        }

        public double getAccuracy() {
            return accuracy;
        }

        public void setAccuracy(double accuracy) {
            this.accuracy = accuracy;
        }
    }
}