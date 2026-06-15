package com.servix.payment.dto;

public record PaymentPreferenceResponse(
    String preferenceId,
    String initPoint,
    String sandboxInitPoint
) {}
