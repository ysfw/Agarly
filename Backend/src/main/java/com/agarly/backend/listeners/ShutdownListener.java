package com.agarly.backend.listeners;

import com.agarly.backend.models.SSE;
import com.agarly.backend.services.EventService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ShutdownListener { // listener to make all users logout because token key changes when restarting

    @Autowired
    private EventService eventService;

    @PostConstruct
    public void init() {
        // Register JVM shutdown hook for more reliable shutdown detection
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("JVM Shutdown Hook - Server shutting down - notifying all clients!");
            sendShutdownEvent();
        }));
        System.out.println("Shutdown hook registered successfully");
    }

    @PreDestroy  // runs RIGHT BEFORE the app shuts down (graceful shutdown only)
    public void onShutdown() {
        System.out.println("@PreDestroy - Server shutting down - notifying all clients!");
        sendShutdownEvent();
    }

    private void sendShutdownEvent() {
        try {
            // Create a logout event for ALL users
            SSE logoutEvent = new SSE("ShutDown", List.of("*"));

            // Push it into the stream
            eventService.publishEvent(logoutEvent);
            
            // Give some time for the event to be sent
            Thread.sleep(500);
            System.out.println("Shutdown event sent successfully");
        } catch (Exception e) {
            System.err.println("Error sending shutdown event: " + e.getMessage());
        }
    }
}
