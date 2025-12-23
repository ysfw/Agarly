package com.agarly.backend.repos;

import com.agarly.backend.dtos.SearchCriteria;
import com.agarly.backend.models.Enums.PriceUnit;
import com.agarly.backend.models.Item;
import jakarta.persistence.criteria.*;
import org.jspecify.annotations.Nullable;
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

    // Helper method to convert degrees to radians
    private Expression<Double> toRadians(Expression<Double> degreeExpression, CriteriaBuilder cb) {
        return cb.prod(degreeExpression, Math.PI / 180.0);
    }

    // Helper method to calculate distance using haversine formula
    private Expression<Double> calculateDistance(CriteriaBuilder cb,
                                                 Expression<Double> itemLat,
                                                 Expression<Double> itemLon,
                                                 Double userLat,
                                                 Double userLng) {

        Expression<Double> lat1Rad = toRadians(cb.literal(userLat), cb);
        Expression<Double> lng1Rad = toRadians(cb.literal(userLng), cb);
        Expression<Double> lat2Rad = toRadians(itemLat, cb);
        Expression<Double> lng2Rad = toRadians(itemLon, cb);

        Expression<Double> deltaLng = cb.diff(lng2Rad, lng1Rad);

        // Haversine formula components
        Expression<Double> sinLat1 = cb.function("SIN", Double.class, lat1Rad);
        Expression<Double> sinLat2 = cb.function("SIN", Double.class, lat2Rad);
        Expression<Double> cosLat1 = cb.function("COS", Double.class, lat1Rad);
        Expression<Double> cosLat2 = cb.function("COS", Double.class, lat2Rad);
        Expression<Double> cosDeltaLng = cb.function("COS", Double.class, deltaLng);

        // Central angle: acos(sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lng2 - lng1))
        Expression<Double> centralAngle = cb.function("ACOS", Double.class,
                cb.sum(
                        cb.prod(sinLat1, sinLat2),
                        cb.prod(cb.prod(cosLat1, cosLat2), cosDeltaLng)
                )
        );

        // Distance in kilometers: Earth R(6371 km) * centralAngle
        return cb.prod(centralAngle, 6371.0);
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
            predicates.add(cb.equal(root.get("status"), criteria.getApprovalStatus()));
        }

        // Distance filter using haversine formula
        if (criteria.getLatitude() != null && criteria.getLongitude() != null && criteria.getRadius() != null) {
            Expression<Double> distance = calculateDistance(
                    cb,
                    root.get("latitude"),
                    root.get("longitude"),
                    criteria.getLatitude(),
                    criteria.getLongitude()
            );
            predicates.add(cb.lessThanOrEqualTo(distance, criteria.getRadius()));
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
                        sortExpression = calculateDistance(
                                cb,
                                root.get("latitude"),
                                root.get("longitude"),
                                criteria.getLatitude(),
                                criteria.getLongitude()
                        );
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