package com.agarly.backend.repos;

import com.agarly.backend.models.ItemRequest;
import com.agarly.backend.models.Enums.ItemStatus;
import com.agarly.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRequestRepository extends JpaRepository<ItemRequest, Long> {
    List<ItemRequest> findByStatus(ItemStatus status);

    List<ItemRequest> findByRequester(User requester);

    long countByStatus(ItemStatus status);
}
