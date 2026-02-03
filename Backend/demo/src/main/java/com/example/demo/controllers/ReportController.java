package com.example.demo.controllers;

import com.example.demo.models.Reports;
import com.example.demo.models.Supporters;
import com.example.demo.models.Matches;
import com.example.demo.repositories.ReportRepository;
import com.example.demo.repositories.SupporterRepository;
import com.example.demo.repositories.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportRepository reportsRepository;

    @Autowired
    private SupporterRepository supportersRepository;

    @Autowired
    private MatchRepository matchesRepository;

    // GET all reports
    @GetMapping("/getAll")
    public ResponseEntity<List<Reports>> getAllReports() {
        try {
            List<Reports> reports = reportsRepository.findAll();
            if (reports.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET reports by supporter ID
    @GetMapping("/get/{id}")
    public ResponseEntity<List<Reports>> getReportsBySupporterId(@PathVariable("id") int supporterId) {
        try {
            Supporters supporterData = supportersRepository.findById(supporterId);
            
            if (supporterData == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            List<Reports> reports = reportsRepository.findBySupporter(supporterData);
            
            if (reports.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // POST add new report
    @PostMapping("/add")
    public ResponseEntity<Reports> addReport(@RequestBody ReportRequest reportRequest) {
        try {
            // Verify supporter exists
            Supporters supporterData = supportersRepository.findById(reportRequest.getSupporterId());
            if (supporterData == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }

            // Verify match exists
            Matches matchData = matchesRepository.findById(reportRequest.getMatchId());
            if (matchData == null) {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }

            Reports newReport = new Reports(
                LocalDateTime.now(),
                reportRequest.getDescription(),
                reportRequest.isBadOrGood(),
                reportRequest.getImageUrl(),
                supporterData
            );
            newReport.setMatch(matchData);

            Reports savedReport = reportsRepository.save(newReport);
            return new ResponseEntity<>(savedReport, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DTO class for report request
    @RestController
    public static class ReportRequest {
        private int supporterId;
        private int matchId;
        private String description;
        private boolean badOrGood;
        private String imageUrl;

        public ReportRequest() {
        }

        public int getSupporterId() {
            return supporterId;
        }

        public void setSupporterId(int supporterId) {
            this.supporterId = supporterId;
        }

        public int getMatchId() {
            return matchId;
        }

        public void setMatchId(int matchId) {
            this.matchId = matchId;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public boolean isBadOrGood() {
            return badOrGood;
        }

        public void setBadOrGood(boolean badOrGood) {
            this.badOrGood = badOrGood;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
}