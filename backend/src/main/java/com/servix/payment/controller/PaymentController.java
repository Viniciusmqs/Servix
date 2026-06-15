package com.servix.payment.controller;

import com.servix.payment.dto.PaymentPreferenceRequest;
import com.servix.payment.dto.PaymentPreferenceResponse;
import com.servix.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Pagamentos via MercadoPago")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/preference")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Criar preferência de pagamento MercadoPago")
    public PaymentPreferenceResponse createPreference(@RequestBody PaymentPreferenceRequest req) {
        return paymentService.createPreference(req);
    }

    @PostMapping("/webhook")
    @Operation(summary = "Webhook MercadoPago — notificações de pagamento")
    public ResponseEntity<Void> webhook(@RequestBody(required = false) Map<String, Object> payload) {
        // Por ora só acusa recebimento. Aqui você processaria atualização de status.
        return ResponseEntity.ok().build();
    }
}
