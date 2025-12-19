package com.agarly.backend.repos;

import com.agarly.backend.models.Item;
import org.springframework.data.jpa.domain.Specification;

public class ItemSpecification {
    public static Specification<Item> hasCategory(String category) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("category"), category);
    }
    
    // Add more specifications as needed
}
