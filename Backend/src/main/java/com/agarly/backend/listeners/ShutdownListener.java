package com.agarly.backend.listeners;

import com.agarly.backend.models.SSE;
import com.agarly.backend.services.EventService;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ShutdownListener { // listener to make all users logout because token key changes when restarting

    @Autowired
    private EventService eventService;

    @PreDestroy  // runs RIGHT BEFORE the app shuts down
    public void onShutdown() {
        System.out.println("Server shutting down - notifying all clients!");

        // Create a logout event for ALL users (using "*" as wildcard)
        SSE logoutEvent = new SSE("LOGOUT", List.of("*"));

        // Push it into the stream
        eventService.publishEvent(logoutEvent);
    }
}
