package com.agarly.backend.controllers;

import com.agarly.backend.models.Enums.OfferStatus;
import com.agarly.backend.models.Offer;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.services.OfferService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/offers")
public class OfferController {
    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping("/request/{requestId}")
    public Offer addOffer(@PathVariable Long requestId,
                          @RequestBody Offer offer,
                          @AuthenticationPrincipal UserPrincipal principal) {
        return offerService.addOffer(principal.getId(), requestId, offer);
    }

    @PatchMapping("/{offerId}/status")
    public Offer updateStatus(@PathVariable Long offerId,
                              @RequestParam OfferStatus status,
                              @RequestParam(required = false) Long borrowerUserId) {
        return offerService.updateOfferStatus(offerId, status, borrowerUserId);
    }

    @GetMapping
    public List<Offer> getOffers(@AuthenticationPrincipal UserPrincipal principal) {
        return offerService.getOffersByUserId(principal.getId());
    }
}
