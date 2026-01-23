package com.example.demo.repositories;

import com.example.demo.models.Notification;
import com.example.demo.models.Supporter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findBySupporterAndIsReadFalse(Supporter supporter);
    List<Notification> findBySupporter(Supporter supporter);
}
