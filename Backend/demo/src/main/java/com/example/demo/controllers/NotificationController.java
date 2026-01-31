package com.example.demo.controllers;

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

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SupporterRepository supporterRepository;

    // Créer une nouvelle notification
    @PostMapping
    public ResponseEntity<Notifications> createNotification(
            @RequestParam int supporterId,
            @RequestBody Notifications notification) {
        Supporters supporter = supporterRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supporter introuvable");
        }
        notification.setSupporter(supporter);
        notification.setDateOfSend(LocalDateTime.now());
        notification.setIsRead(false);
        Notifications savedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(savedNotification);
    }

    // Récupérer toutes les notifications pour un supporter
    @GetMapping("/supporter/{supporterId}")
    public ResponseEntity<List<Notifications>> getNotificationsBySupporter(@PathVariable int supporterId) {
        Supporters supporter = supporterRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supporter introuvable");
        }
        List<Notifications> notifications = notificationRepository.findBySupporterOrderByDateOfSendDesc(supporter);
        return ResponseEntity.ok(notifications);
    }

    // Récupérer les notifications non lues pour un supporter
    @GetMapping("/supporter/{supporterId}/unread")
    public ResponseEntity<List<Notifications>> getUnreadNotifications(@PathVariable int supporterId) {
        Supporters supporter = supporterRepository.findById(supporterId);
        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supporter introuvable");
        }
        List<Notifications> unreadNotifications = notificationRepository.findBySupporterAndIsReadFalse(supporter);
        return ResponseEntity.ok(unreadNotifications);
    }

    // Marquer une notification comme lue
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notifications> markAsRead(@PathVariable int notificationId) {
        Notifications notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notification introuvable"));
        notification.setIsRead(true);
        Notifications updatedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(updatedNotification);
    }

    // Supprimer une notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable int notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification introuvable");
        }
        notificationRepository.deleteById(notificationId);
        return ResponseEntity.ok().build();
    }
}
