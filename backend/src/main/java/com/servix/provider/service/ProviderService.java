package com.servix.provider.service;

import com.servix.domain.entity.Provider;
import com.servix.domain.entity.User;
import com.servix.domain.repository.ProviderRepository;
import com.servix.domain.repository.UserRepository;
import com.servix.exception.ResourceNotFoundException;
import com.servix.provider.dto.ProviderProfileRequest;
import com.servix.provider.dto.ProviderResponse;
import com.servix.provider.dto.UpdateAvailabilityRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProviderService {

    private static final int FEATURED_LIMIT = 10;

    private final ProviderRepository providerRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ProviderResponse> listAll(String category, String city, String query, Pageable pageable) {
        return providerRepository.findWithFilters(category, city, query, pageable).map(ProviderResponse::from);
    }

    @Transactional(readOnly = true)
    public List<ProviderResponse> getFeatured() {
        return providerRepository.findFeatured(PageRequest.of(0, FEATURED_LIMIT))
                .stream()
                .map(ProviderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProviderResponse getById(UUID id) {
        return providerRepository.findById(id)
                .map(ProviderResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Provider", "not found"));
    }

    @Transactional(readOnly = true)
    public ProviderResponse getByCurrentUser(String email) {
        User user = findUserByEmail(email);
        Provider provider = providerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile", "not found"));
        return ProviderResponse.from(provider);
    }

    @Transactional
    public ProviderResponse createOrUpdate(ProviderProfileRequest req, String email) {
        User user = findUserByEmail(email);

        Provider provider = providerRepository.findByUser(user)
                .orElseGet(() -> Provider.builder().user(user).build());

        provider.setCategory(req.category());
        provider.setDescription(req.description());
        provider.setHourlyRate(req.hourlyRate());
        provider.setCity(req.city());
        provider.setLatitude(req.latitude());
        provider.setLongitude(req.longitude());

        return ProviderResponse.from(providerRepository.save(provider));
    }

    @Transactional
    public ProviderResponse updateAvailability(UpdateAvailabilityRequest req, String email) {
        User user = findUserByEmail(email);
        Provider provider = providerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile", "not found"));
        provider.setAvailable(req.available());
        return ProviderResponse.from(providerRepository.save(provider));
    }

    @Transactional
    public void delete(String email) {
        User user = findUserByEmail(email);
        Provider provider = providerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile", "not found"));
        providerRepository.delete(provider);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "not found"));
    }
}
