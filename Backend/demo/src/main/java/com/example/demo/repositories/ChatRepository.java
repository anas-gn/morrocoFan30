package com.example.demo.repositories;

import com.example.demo.models.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Integer> {
    List<Chat> findBySupporterId(Integer supporterId);

    List<Chat> findByCountry(String country);

    List<Chat> findByDateOfSendAfter(LocalDateTime dateOfSend);

    List<Chat> findBySupporterIdOrderByDateOfSendDesc(Integer supporterId);
}