package com.example.demo.controllers;

import com.example.demo.hooks.NewsDTO;
import com.example.demo.models.News;
import com.example.demo.models.Teams;
import com.example.demo.repositories.NewsRepository;
import com.example.demo.repositories.TeamRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private TeamRepository teamsRepository;

        // une entité -> DTO
    
    private NewsDTO convertToDTO(News news) {
        NewsDTO dto = new NewsDTO();
        dto.setId(news.getId());
        dto.setTitle(news.getTitle());
        dto.setAuthor(news.getAuthor());
        dto.setDescription(news.getDescription());
        dto.setDetail(news.getDetail());
        dto.setImageUrl(news.getImageUrl());
        dto.setDateOfCreation(news.getDateOfCreation());

        if (news.getTeam() != null) {
            dto.setTeamId(news.getTeam().getId());
            dto.setTeamName(news.getTeam().getName());
        }

        return dto;
    }


    //   GET /api/news
    //   Afficher toutes les news (pour tous les utilisateurs)
    
    @GetMapping
    public ResponseEntity<List<NewsDTO>> getAllNews() {
        try {
            List<News> newsList = newsRepository.findAllByOrderByDateOfCreationDesc();
            List<NewsDTO> newsDTOs = newsList.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(newsDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
     // GET /api/news/{id}
     // Afficher une news par son ID
     
    @GetMapping("/{id}")
    public ResponseEntity<NewsDTO> getNewsById(@PathVariable Integer id) {
        try {
            Optional<News> news = newsRepository.findById(id);
            if (news.isPresent()) {
                return ResponseEntity.ok(convertToDTO(news.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
     // GET /api/news/team/{teamId}
     //  Afficher toutes les news d'une équipe
    
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<NewsDTO>> getNewsByTeam(@PathVariable Integer teamId) {
        try {
            List<News> newsList = newsRepository.findByTeamIdOrderByDateOfCreationDesc(teamId);
            List<NewsDTO> newsDTOs = newsList.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(newsDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

   
    
     // POST /api/news
     // Créer une nouvelle news 
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createNews(@RequestBody NewsDTO newsDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Vérifier que l'équipe existe
            Optional<Teams> team = teamsRepository.findById(newsDTO.getTeamId());
            if (!team.isPresent()) {
                response.put("success", false);
                response.put("message", "Équipe non trouvée");
                return ResponseEntity.badRequest().body(response);
            }

            // Créer la news
            News news = new News();
            news.setTitle(newsDTO.getTitle());
            news.setAuthor(newsDTO.getAuthor());
            news.setDescription(newsDTO.getDescription());
            news.setDetail(newsDTO.getDetail());
            news.setImageUrl(newsDTO.getImageUrl());
            news.setTeam(team.get());
            news.setDateOfCreation(LocalDateTime.now());

            News savedNews = newsRepository.save(news);

            response.put("success", true);
            response.put("message", "News créée avec succès");
            response.put("data", convertToDTO(savedNews));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la création: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    
     //  PUT /api/news/{id}
     //  Mettre à jour une news 
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateNews(
            @PathVariable Integer id,
            @RequestBody NewsDTO newsDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<News> existingNews = newsRepository.findById(id);
            if (!existingNews.isPresent()) {
                response.put("success", false);
                response.put("message", "News non trouvée");
                return ResponseEntity.notFound().build();
            }

            News news = existingNews.get();

            // Mise à jour des champs
            if (newsDTO.getTitle() != null) {
                news.setTitle(newsDTO.getTitle());
            }
            if (newsDTO.getAuthor() != null) {
                news.setAuthor(newsDTO.getAuthor());
            }
            if (newsDTO.getDescription() != null) {
                news.setDescription(newsDTO.getDescription());
            }
            if (newsDTO.getDetail() != null) {
                news.setDetail(newsDTO.getDetail());
            }
            if (newsDTO.getImageUrl() != null) {
                news.setImageUrl(newsDTO.getImageUrl());
            }

            // Mise à jour de l'équipe
            if (newsDTO.getTeamId() != 0) {
                Optional<Teams> team = teamsRepository.findById(newsDTO.getTeamId());
                if (team.isPresent()) {
                    news.setTeam(team.get());
                } else {
                    response.put("success", false);
                    response.put("message", "Équipe non trouvée");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            News updatedNews = newsRepository.save(news);

            response.put("success", true);
            response.put("message", "News mise à jour avec succès");
            response.put("data", convertToDTO(updatedNews));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la mise à jour: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    
       // DELETE /api/news/{id}
     //  Supprimer une news 
     
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNews(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<News> news = newsRepository.findById(id);
            if (!news.isPresent()) {
                response.put("success", false);
                response.put("message", "News non trouvée");
                return ResponseEntity.notFound().build();
            }

            newsRepository.deleteById(id);

            response.put("success", true);
            response.put("message", "News supprimée avec succès");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}