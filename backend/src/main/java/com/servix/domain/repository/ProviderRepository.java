package com.servix.domain.repository;

import com.servix.domain.entity.Provider;
import com.servix.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProviderRepository extends JpaRepository<Provider, UUID> {

    Optional<Provider> findByUser(User user);

    boolean existsByUser(User user);

    @Query(value = """
            SELECT p.* FROM providers p
            JOIN users u ON u.id = p.user_id
            WHERE (:category IS NULL OR p.category ILIKE CONCAT('%', CAST(:category AS TEXT), '%'))
              AND (:city IS NULL OR p.city ILIKE CONCAT('%', CAST(:city AS TEXT), '%'))
              AND (:query IS NULL OR
                   p.category ILIKE CONCAT('%', CAST(:query AS TEXT), '%') OR
                   u.name ILIKE CONCAT('%', CAST(:query AS TEXT), '%') OR
                   p.description ILIKE CONCAT('%', CAST(:query AS TEXT), '%'))
            """,
            countQuery = """
            SELECT COUNT(*) FROM providers p
            JOIN users u ON u.id = p.user_id
            WHERE (:category IS NULL OR p.category ILIKE CONCAT('%', CAST(:category AS TEXT), '%'))
              AND (:city IS NULL OR p.city ILIKE CONCAT('%', CAST(:city AS TEXT), '%'))
              AND (:query IS NULL OR
                   p.category ILIKE CONCAT('%', CAST(:query AS TEXT), '%') OR
                   u.name ILIKE CONCAT('%', CAST(:query AS TEXT), '%') OR
                   p.description ILIKE CONCAT('%', CAST(:query AS TEXT), '%'))
            """,
            nativeQuery = true)
    Page<Provider> findWithFilters(
            @Param("category") String category,
            @Param("city") String city,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            SELECT p FROM Provider p
            WHERE p.available = true
            ORDER BY p.rating DESC, p.totalReviews DESC
            """)
    List<Provider> findFeatured(Pageable pageable);
}
