package com.example.demo.repositories;

import com.example.demo.models.Notifications;
import com.example.demo.models.Supporters;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notifications, Integer> {

    // Trouver toutes les notifications non lues pour un supporter
    List<Notifications> findBySupporterAndIsReadFalse(Supporters supporter);

    // Trouver toutes les notifications pour un supporter, triees par date decroissante
    List<Notifications> findBySupporterOrderByDateOfSendDesc(Supporters supporter);

    // Trouver les notifications envoyées après une certaine date
    List<Notifications> findByDateOfSendAfter(LocalDateTime date);

    // Trouver les notifications non lues pour un supporter et envoyées après une certaine date
    @Query("SELECT n FROM Notifications n WHERE n.supporter = :supporter AND n.isRead = false AND n.dateOfSend > :date")
    List<Notifications> findUnreadNotificationsAfterDate(@Param("supporter") Supporters supporter, @Param("date") LocalDateTime date);
}
