package com.example.demo.controllers;

import com.example.demo.hooks.NewsDTO;
import com.example.demo.models.Images;
import com.example.demo.models.News;
import com.example.demo.models.Notifications;
import com.example.demo.models.Supporters;
import com.example.demo.models.Teams;
import com.example.demo.repositories.ImageRepository;
import com.example.demo.repositories.NewsRepository;
import com.example.demo.repositories.NotificationRepository;
import com.example.demo.repositories.SupporterRepository;
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
@CrossOrigin(origins = "*")
@RequestMapping("/api/news")
public class NewsController {

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SupporterRepository supportersRepository;

    @Autowired
    private ImageRepository imagesRepository;

   
     //  News -> NewsDTO
    
private NewsDTO convertToDTO(News news) {

    // Récupérer toutes les images supplémentaires de la news
    List<String> images = imagesRepository
            .findByTypeAndOwnerID("news", news.getId())
            .stream()
            .map(Images::getImageUrl)
            .collect(Collectors.toList());

    NewsDTO dto = new NewsDTO();
    dto.setId(news.getId());
    dto.setTitle(news.getTitle());
    dto.setAuthor(news.getAuthor());
    dto.setDescription(news.getDescription());
    dto.setDetail(news.getDetail());
    dto.setImageUrl(news.getImageUrl()); // image principale
    dto.setDateOfCreation(news.getDateOfCreation());
    dto.setImages(images); // images supplémentaires

    if (news.getTeam() != null) {
        dto.setTeamId(news.getTeam().getId());
        dto.setTeamName(news.getTeam().getName());
    }

    return dto;
}

    
     // Envoyer une notification à tous les supporters
     
    private void sendNotificationToAllSupporters(News news) {
        try {
            // Récupérer tous les supporters
            List<Supporters> allSupporters = supportersRepository.findAll();
            
            // Créer le contenu de la notification
            String notificationContent = "Nouvelle actualité : " + news.getTitle() + 
                                        " (Équipe : " + news.getTeam().getName() + ")";
            
            // Créer une notification pour chaque supporter
            for (Supporters supporter : allSupporters) {
                Notifications notification = new Notifications();
                notification.setDateOfSend(LocalDateTime.now());
                notification.setContent(notificationContent);
                notification.setIsRead(false);
                notification.setSupporter(supporter);
                
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            // Log l'erreur mais ne bloque pas la création de la news
            System.err.println("Erreur lors de l'envoi des notifications: " + e.getMessage());
        }
    }


     // Envoyer une notification de mise à jour à tous les supporters
     
    private void sendUpdateNotificationToAllSupporters(News news) {
        try {
            // Récupérer tous les supporters
            List<Supporters> allSupporters = supportersRepository.findAll();
            
            // Créer le contenu de la notification
            String notificationContent = "Actualité modifiée : " + news.getTitle() + 
                                        " (Équipe : " + news.getTeam().getName() + ")";
            
            // Créer une notification pour chaque supporter
            for (Supporters supporter : allSupporters) {
                Notifications notification = new Notifications();
                notification.setDateOfSend(LocalDateTime.now());
                notification.setContent(notificationContent);
                notification.setIsRead(false);
                notification.setSupporter(supporter);
                
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            // Log l'erreur mais ne bloque pas la mise à jour de la news
            System.err.println("Erreur lors de l'envoi des notifications de mise à jour: " + e.getMessage());
        }
    }

   
     // GET /api/news
     //Afficher toutes les news
     
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
     // Afficher toutes les news d'une équipe
     
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

    
    // POST /api/news/{newsId}/images
     //  Ajouter des images supplémentaires à une news existante
     
    @PostMapping("/{newsId}/images")
    public ResponseEntity<Map<String, Object>> addImagesToNews(
            @PathVariable Integer newsId,
            @RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Vérifier que la news existe
            Optional<News> existingNews = newsRepository.findById(newsId);
            if (!existingNews.isPresent()) {
                response.put("success", false);
                response.put("message", "News non trouvée");
                return ResponseEntity.notFound().build();
            }

            // Récupérer les URLs des images
            @SuppressWarnings("unchecked")
            List<String> imageUrls = (List<String>) request.get("imageUrls");
            
            if (imageUrls == null || imageUrls.isEmpty()) {
                response.put("success", false);
                response.put("message", "Aucune image fournie");
                return ResponseEntity.badRequest().body(response);
            }

            // Ajouter chaque image
            for (String imageUrl : imageUrls) {
                Images image = new Images();
                image.setImageUrl(imageUrl);
                image.setType("news");
                image.setOwnerID(newsId);
                imagesRepository.save(image);
            }

            response.put("success", true);
            response.put("message", imageUrls.size() + " image(s) ajoutée(s) avec succès");
            response.put("data", convertToDTO(existingNews.get()));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de l'ajout des images: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    
     // GET /api/news/{newsId}/images
     // Récupérer toutes les images supplémentaires d'une news
     
    @GetMapping("/{newsId}/images")
    public ResponseEntity<List<String>> getNewsImages(@PathVariable Integer newsId) {
        try {
            List<Images> images = imagesRepository.findByTypeAndOwnerID("news", newsId);
            List<String> imageUrls = images.stream()
                    .map(Images::getImageUrl)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(imageUrls);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    
    // ============= GESTION ADMIN (CRUD) =============


     // POST /api/news
     // Créer une nouvelle news
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createNews(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Extraire les données de la news
            NewsDTO newsDTO = new NewsDTO();
            newsDTO.setTitle((String) request.get("title"));
            newsDTO.setAuthor((String) request.get("author"));
            newsDTO.setDescription((String) request.get("description"));
            newsDTO.setDetail((String) request.get("detail"));
            newsDTO.setImageUrl((String) request.get("imageUrl")); // Image principale
            newsDTO.setTeamId((Integer) request.get("teamId"));

            // Vérifier que l'équipe existe
            Optional<Teams> team = teamRepository.findById(newsDTO.getTeamId());
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
            news.setImageUrl(newsDTO.getImageUrl()); // Image principale
            news.setTeam(team.get());
            news.setDateOfCreation(LocalDateTime.now());

            News savedNews = newsRepository.save(news);

            // Ajouter les images supplémentaires si elles existent
            @SuppressWarnings("unchecked")
            List<String> additionalImages = (List<String>) request.get("additionalImages");
            if (additionalImages != null && !additionalImages.isEmpty()) {
                for (String imageUrl : additionalImages) {
                    Images image = new Images();
                    image.setImageUrl(imageUrl);
                    image.setType("news");
                    image.setOwnerID(savedNews.getId());
                    imagesRepository.save(image);
                }
            }

            // Envoyer une notification à tous les supporters
            sendNotificationToAllSupporters(savedNews);

            response.put("success", true);
            response.put("message", "News créée avec succès et notifications envoyées");
            response.put("data", convertToDTO(savedNews));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la création: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    
     // PUT /api/news/{id}
     // Mettre à jour une news (Admin seulement)
     
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
                Optional<Teams> team = teamRepository.findById(newsDTO.getTeamId());
                if (team.isPresent()) {
                    news.setTeam(team.get());
                } else {
                    response.put("success", false);
                    response.put("message", "Équipe non trouvée");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            News updatedNews = newsRepository.save(news);

            // Envoyer une notification de mise à jour à tous les supporters
            sendUpdateNotificationToAllSupporters(updatedNews);

            response.put("success", true);
            response.put("message", "News mise à jour avec succès et notifications envoyées");
            response.put("data", convertToDTO(updatedNews));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la mise à jour: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    
     // DELETE /api/news/{id}
     // Supprimer une news (Admin seulement)
     
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