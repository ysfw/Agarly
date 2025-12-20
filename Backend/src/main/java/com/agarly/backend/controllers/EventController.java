package com.agarly.backend.controllers;

import com.agarly.backend.models.SSE;
import com.agarly.backend.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
public class EventController {


@Autowired
private EventService eventService;

    //The SSE endpoint that subscribes to our eventService
    @GetMapping(path = "/event-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<SSE>> streamUpdates(Authentication authentication) {
        String username = authentication.getName();
        return eventService.getEventStream()
                .map(event -> ServerSentEvent
                        .<SSE>builder()
                        .data((event.getTo().contains("*") || event.getTo().contains(username)) ? event : null)
                        .build());
    }


}
