package com.example.demo.controllers;

import com.example.demo.models.Notifications;
import com.example.demo.models.Supporters;
import com.example.demo.repositories.NotificationRepository;
import com.example.demo.repositories.SupporterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
        Optional<Supporters> supporterOptional = supporterRepository.findById(supporterId);
        if (supporterOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        notification.setSupporter(supporterOptional.get());
        notification.setDateOfSend(LocalDateTime.now());
        notification.setIsRead(false);
        Notifications savedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(savedNotification);
    }

    // Récupérer toutes les notifications pour un supporter
    @GetMapping("/supporter/{supporterId}")
    public ResponseEntity<List<Notifications>> getNotificationsBySupporter(@PathVariable int supporterId) {
        Optional<Supporters> supporterOptional = supporterRepository.findById(supporterId);
        if (supporterOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<Notifications> notifications = notificationRepository.findBySupporterOrderByDateOfSendDesc(supporterOptional.get());
        return ResponseEntity.ok(notifications);
    }

    // Récupérer les notifications non lues pour un supporter
    @GetMapping("/supporter/{supporterId}/unread")
    public ResponseEntity<List<Notifications>> getUnreadNotifications(@PathVariable int supporterId) {
        Optional<Supporters> supporterOptional = supporterRepository.findById(supporterId);
        if (supporterOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<Notifications> unreadNotifications = notificationRepository.findBySupporterAndIsReadFalse(supporterOptional.get());
        return ResponseEntity.ok(unreadNotifications);
    }

    // Marquer une notification comme lue
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notifications> markAsRead(@PathVariable int notificationId) {
        Optional<Notifications> notificationOptional = notificationRepository.findById(notificationId);
        if (notificationOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Notifications notification = notificationOptional.get();
        notification.setIsRead(true);
        Notifications updatedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(updatedNotification);
    }

    // Supprimer une notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable int notificationId) {
        if (notificationRepository.existsById(notificationId)) {
            notificationRepository.deleteById(notificationId);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
