package com.servix.payment.dto;

import java.math.BigDecimal;

public record PaymentPreferenceRequest(
    String requestId,
    String title,
    BigDecimal amount
) {}
