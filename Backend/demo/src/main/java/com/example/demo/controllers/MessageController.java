package com.example.demo.controllers;

import com.example.demo.models.Messages;
import com.example.demo.models.Supporters;
import com.example.demo.repositories.MessageRepository;
import com.example.demo.repositories.SupporterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SupporterRepository supporterRepository;

    // Envoyer un message (REST)
    @PostMapping("/send")
    public ResponseEntity<Messages> sendMessage(
            @RequestParam String content,
            @RequestParam String country,
            @RequestParam int supporterId) {

        Supporters supporter = supporterRepository.findById(supporterId)
                .orElseThrow(() -> new RuntimeException("Supporter introuvable"));

        Messages message = new Messages(content, country, LocalDateTime.now(), supporter);
        Messages savedMessage = messageRepository.save(message);

        return ResponseEntity.ok(savedMessage);
    }

    // Lire tous les messages pour une communaute
    @GetMapping("/community/{country}")
    public ResponseEntity<List<Messages>> getMessagesByCommunity(@PathVariable String country) {
        List<Messages> messages = messageRepository.findByCountryOrderByDateOfSendAsc(country);
        return ResponseEntity.ok(messages);
    }

    // Lire tous les messages envoyes par un supporter
    @GetMapping("/supporter/{supporterId}")
    public ResponseEntity<List<Messages>> getMessagesBySupporter(@PathVariable int supporterId) {
        List<Messages> messages = messageRepository.findBySupporterIdOrderByDateOfSendAsc(supporterId);
        return ResponseEntity.ok(messages);
    }
}
