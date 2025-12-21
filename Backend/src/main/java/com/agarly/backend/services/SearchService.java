package com.agarly.backend.services;

import com.agarly.backend.dtos.SearchCriteria;
import com.agarly.backend.models.Enums.ItemStatus;
import com.agarly.backend.models.Item;
import com.agarly.backend.repos.ItemRepository;
import com.agarly.backend.repos.ItemSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchService {
    @Autowired
    private ItemRepository itemRepository;

    public List<Item> searchItems(SearchCriteria criteria) {
        Specification<Item> spec = ItemSpecification.withCriteria(criteria);    // build dynamic Predicates based on filters, price,..
        return itemRepository.findAll(spec);
    }

    public List<Item> getFeed() {
        SearchCriteria criteria = new SearchCriteria();

        criteria.setApprovalStatus(ItemStatus.APPROVED);
        criteria.setSortBy("newest");
        criteria.setSortDirection("desc");

        return itemRepository.findAll(ItemSpecification.withCriteria(criteria));
    }
}
