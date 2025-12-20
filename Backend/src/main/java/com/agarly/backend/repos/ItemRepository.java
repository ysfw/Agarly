package com.agarly.backend.repos;

import com.agarly.backend.models.Enums.ItemCategory;
import com.agarly.backend.models.Item;
import com.agarly.backend.models.User;
import jakarta.validation.Valid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

    @Valid List<Item> findByCategory(ItemCategory category);

    List<Item> findByOwner(User owner);

    List<Item> findByBorrower(User borrower);
}
