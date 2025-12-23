package com.agarly.backend.services;

import com.agarly.backend.models.Enums.OfferStatus;
import com.agarly.backend.models.ItemRequest;
import com.agarly.backend.models.Offer;
import com.agarly.backend.models.User;
import com.agarly.backend.repos.ItemRepository;
import com.agarly.backend.repos.ItemRequestRepository;
import com.agarly.backend.repos.OfferRepository;
import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OfferService {
    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private ItemRequestRepository itemRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;


    public Offer addOffer(Long id, Long requestId, Offer offer) {
        ItemRequest request = itemRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        offer.setId(null);
        offer.setItemRequest(request);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        offer.setUser(user);
        if (offer.getStatus() == null) {
            offer.setStatus(OfferStatus.PENDING);
        }
        return offerRepository.save(offer);
    }

    public Offer updateOfferStatus(Long offerId, OfferStatus newStatus, Long borrowerUserId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));

        OfferStatus previousStatus = offer.getStatus();
        ItemRequest request = offer.getItemRequest();

        if (previousStatus == OfferStatus.PENDING && newStatus == OfferStatus.ACCEPTED) {
            if (borrowerUserId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "borrowerUserId is required when accepting an offer");
            }
            request.setBorrowerUserId(borrowerUserId);
            itemRequestRepository.save(request);
        } else if (previousStatus == OfferStatus.ACCEPTED && newStatus == OfferStatus.COMPLETED) {
            request.setBorrowerUserId(null);
            itemRequestRepository.save(request);
        }

        offer.setStatus(newStatus);
        return offerRepository.save(offer);
    }

    public List<Offer> getOffersByUserId(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return offerRepository.findByUserId(userId);
    }
}
