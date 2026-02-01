package com.example.demo.controllers;

import com.example.demo.hooks.NotificationDTO;
import com.example.demo.models.Notifications;
import com.example.demo.models.Supporters;
import com.example.demo.repositories.NotificationRepository;
import com.example.demo.repositories.SupporterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SupporterRepository supporterRepository;

    // Créer une nouvelle notification (retourne un DTO)
    @PostMapping("/add")
    public ResponseEntity<NotificationDTO> createNotification(
            @RequestParam int supporterId,
            @RequestBody NotificationDTO notificationDTO) {
        Supporters supporter = supporterRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supporter introuvable");
        }

        Notifications notification = new Notifications();
        notification.setContent(notificationDTO.getContent());
        notification.setSupporter(supporter);
        notification.setDateOfSend(LocalDateTime.now());
        notification.setIsRead(false);

        Notifications savedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(convertToDTO(savedNotification));
    }

    // Récupérer toutes les notifications pour un supporter (retourne une liste de DTO)
    @GetMapping("/supporter/{supporterId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsBySupporter(@PathVariable int supporterId) {
        Supporters supporter = supporterRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supporter introuvable");
        }
        List<Notifications> notifications = notificationRepository.findBySupporterOrderByDateOfSendDesc(supporter);
        List<NotificationDTO> notificationDTOs = notifications.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(notificationDTOs);
    }

    // Récupérer les notifications non lues pour un supporter (retourne une liste de DTO)
    @GetMapping("/supporter/{supporterId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable int supporterId) {
        Supporters supporter = supporterRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supporter introuvable");
        }
        List<Notifications> unreadNotifications = notificationRepository.findBySupporterAndIsReadFalse(supporter);
        List<NotificationDTO> notificationDTOs = unreadNotifications.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(notificationDTOs);
    }

    // Marquer une notification comme lue (retourne un DTO)
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable int notificationId) {
        Notifications notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notification introuvable"));
        notification.setIsRead(true);
        Notifications updatedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(convertToDTO(updatedNotification));
    }

    // Supprimer une notification (inchangé)
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable int notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification introuvable");
        }
        notificationRepository.deleteById(notificationId);
        return ResponseEntity.ok().build();
    }

    // Méthode utilitaire pour convertir une entité Notifications en DTO
    private NotificationDTO convertToDTO(Notifications notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setDateOfSend(notification.getDateOfSend());
        dto.setContent(notification.getContent());
        dto.setIsRead(notification.getIsRead());
        dto.setSupporterId(notification.getSupporter().getId());
        dto.setSupportName(notification.getSupporter().getName());
        return dto;
    }
}
