package com.agarly.backend.repos;

import com.agarly.backend.dtos.SearchCriteria;
import com.agarly.backend.models.Enums.PriceUnit;
import com.agarly.backend.models.Item;
import jakarta.persistence.criteria.*;
import org.checkerframework.checker.units.qual.A;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ItemSpecification implements Specification<Item> {

    private final SearchCriteria criteria;
    public ItemSpecification(SearchCriteria criteria) {
        this.criteria = criteria;
    }

    public static Specification<Item> withCriteria (SearchCriteria criteria) {
        return new ItemSpecification(criteria);
    }

    // is called automatically by JPA when passing specification to the repo
    @Override
    public @Nullable Predicate toPredicate(Root<Item> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();

        Expression<BigDecimal> effectivePrice = cb.<BigDecimal>selectCase()
                .when(cb.equal(root.get("priceUnit"), PriceUnit.HOUR), cb.prod(root.get("pricePerDay"), new BigDecimal(24)))
                .otherwise(root.get("pricePerDay"));


        if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
            String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            ));
        }
        if (criteria.getCategory() != null) {
            predicates.add(cb.equal(root.get("category"), criteria.getCategory()));
        }
        if (criteria.getPriceUnit() != null) {
            predicates.add(cb.equal(root.get("priceUnit"), criteria.getPriceUnit()));
        }
        if (criteria.getMinPrice() != null) {
            predicates.add(cb.greaterThanOrEqualTo(effectivePrice, criteria.getMinPrice()));
        }
        if (criteria.getMaxPrice() != null) {
            predicates.add(cb.lessThanOrEqualTo(effectivePrice, criteria.getMaxPrice()));
        }
        if (criteria.getRentalStatus() != null) {
            predicates.add(cb.equal(root.get("rentalStatus"), criteria.getRentalStatus()));
        }
        if (criteria.getApprovalStatus() != null) {         // only for feed
            predicates.add(cb.equal(root.get("approvalStatus"), criteria.getApprovalStatus()));
        }
        if (criteria.getLatitude() != null && criteria.getLongitude() != null && criteria.getRadius() != null) {
            Expression<Double> latDiff = cb.diff(root.get("latitude"), criteria.getLatitude());     // lat - lat0
            Expression<Double> lngDiff = cb.diff(root.get("longitude"), criteria.getLongitude());    // lng - lng0
            Expression<Double> distanceSquared = cb.sum(cb.prod(latDiff, latDiff), cb.prod(lngDiff, lngDiff));
            predicates.add(cb.lessThanOrEqualTo(distanceSquared, criteria.getRadius() * criteria.getRadius()));
        }

        // Combine all predicates
        Predicate finalPredicate = cb.and(predicates.toArray(new Predicate[0]));

        // Sorting
        if (criteria.getSortBy() != null) {
            Expression<?> sortExpression;
            switch (criteria.getSortBy()) {
                case "price": sortExpression = root.get("pricePerDay"); break;
                case "rating": sortExpression = root.get("rating"); break;
                case "distance":
                    if (criteria.getLatitude() != null && criteria.getLongitude() != null) {
                        Expression<Double> latDiff = cb.diff(root.get("latitude"), criteria.getLatitude());
                        Expression<Double> lngDiff = cb.diff(root.get("longitude"), criteria.getLongitude());
                        sortExpression = cb.sum(cb.prod(latDiff, latDiff), cb.prod(lngDiff, lngDiff));
                    } else {
                        sortExpression = root.get("id"); // fallback
                    }
                    break;
                case "newest":
                default: sortExpression = root.get("id"); //  (higher id = newer)
            }

            if ("desc".equalsIgnoreCase(criteria.getSortDirection())) {
                query.orderBy(cb.desc(sortExpression));
            } else {
                query.orderBy(cb.asc(sortExpression));
            }
        }

        return finalPredicate;
    }
}
