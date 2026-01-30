package com.example.demo.controllers;

import com.example.demo.models.Messages;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    // WebSocket: Envoyer un message en temps reel
    @MessageMapping("/sendWebSocketMessage")
    @SendTo("/topic/messages")
    public Messages handleWebSocketMessage(Messages message) {
       
        return message;
    }
}
