package com.example.demo.controllers;

import com.example.demo.hooks.MessageDTO;
import com.example.demo.models.Messages;
import com.example.demo.models.Supporters;
import com.example.demo.repositories.MessageRepository;
import com.example.demo.repositories.SupporterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SupporterRepository supporterRepository;

    // Envoyer un message (retourne un DTO)
    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(
            @RequestParam String content,
            @RequestParam String country,
            @RequestParam int supporterId) {

        Supporters supporter = supporterRepository.findById(supporterId);

        if (supporter == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Supporter introuvable");
        }

        Messages message = new Messages(content, country, LocalDateTime.now(), supporter);
        Messages savedMessage = messageRepository.save(message);

        return ResponseEntity.ok(convertToDTO(savedMessage));
    }

    // Lire tous les messages pour une communauté (retourne une liste de DTO)
    @GetMapping("/community/{country}")
    public ResponseEntity<List<MessageDTO>> getMessagesByCommunity(@PathVariable String country) {
        List<Messages> messages = messageRepository.findByCountryOrderByDateOfSendAsc(country);
        List<MessageDTO> messageDTOs = messages.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(messageDTOs);
    }

    // Lire tous les messages envoyés par un supporter (retourne une liste de DTO)
    @GetMapping("/supporter/{supporterId}")
    public ResponseEntity<List<MessageDTO>> getMessagesBySupporter(@PathVariable int supporterId) {
        List<Messages> messages = messageRepository.findBySupporterIdOrderByDateOfSendAsc(supporterId);
        List<MessageDTO> messageDTOs = messages.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(messageDTOs);
    }

    // Méthode utilitaire pour convertir une entité Messages en DTO
    private MessageDTO convertToDTO(Messages message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setCountry(message.getCountry());
        dto.setDateOfSend(message.getDateOfSend());
        dto.setSupporterId(message.getSupporter().getId());
        dto.setName(message.getSupporter().getName());
        return dto;
    }
}
