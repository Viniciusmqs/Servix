package com.servix.payment.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.*;
import com.mercadopago.resources.preference.Preference;
import com.servix.payment.dto.PaymentPreferenceRequest;
import com.servix.payment.dto.PaymentPreferenceResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class PaymentService {

    @Value("${mercadopago.access-token}")
    private String accessToken;

    public PaymentPreferenceResponse createPreference(PaymentPreferenceRequest req) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);
            PreferenceClient client = new PreferenceClient();
            PreferenceRequest preference = PreferenceRequest.builder()
                .items(List.of(
                    PreferenceItemRequest.builder()
                        .title("Servix — " + req.title())
                        .quantity(1)
                        .unitPrice(req.amount())
                        .currencyId("BRL")
                        .build()
                ))
                .backUrls(PreferenceBackUrlsRequest.builder()
                    .success("servix://payment/success?requestId=" + req.requestId())
                    .failure("servix://payment/failure?requestId=" + req.requestId())
                    .pending("servix://payment/pending?requestId=" + req.requestId())
                    .build())
                .autoReturn("approved")
                .externalReference(req.requestId())
                .build();

            Preference result = client.create(preference);
            return new PaymentPreferenceResponse(
                result.getId(),
                result.getInitPoint(),
                result.getSandboxInitPoint()
            );
        } catch (Exception e) {
            log.error("MercadoPago error: {}", e.getMessage());
            throw new RuntimeException("Erro ao criar preferência de pagamento: " + e.getMessage());
        }
    }
}
