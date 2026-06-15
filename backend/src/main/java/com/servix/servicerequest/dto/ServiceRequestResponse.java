package com.servix.servicerequest.dto;

import com.servix.domain.entity.ServiceRequest;
import com.servix.domain.enums.RequestStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ServiceRequestResponse(
        UUID id,
        UUID clientId,
        String clientName,
        UUID providerId,
        String providerName,
        String providerPhone,
        String title,
        String description,
        String category,
        RequestStatus status,
        OffsetDateTime scheduledAt,
        String address,
        Double latitude,
        Double longitude,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        int proposalCount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static ServiceRequestResponse from(ServiceRequest sr) {
        return new ServiceRequestResponse(
                sr.getId(),
                sr.getClient().getId(),
                sr.getClient().getName(),
                sr.getProvider() != null ? sr.getProvider().getId() : null,
                sr.getProvider() != null ? sr.getProvider().getName() : null,
                sr.getProvider() != null ? sr.getProvider().getPhone() : null,
                sr.getTitle(),
                sr.getDescription(),
                sr.getCategory(),
                sr.getStatus(),
                sr.getScheduledAt(),
                sr.getAddress(),
                sr.getLatitude(),
                sr.getLongitude(),
                sr.getBudgetMin(),
                sr.getBudgetMax(),
                sr.getProposals().size(),
                sr.getCreatedAt(),
                sr.getUpdatedAt()
        );
    }
}
