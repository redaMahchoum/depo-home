package com.agentstore.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TokenRefreshRequest {
    
    @NotBlank(message = "Refresh token cannot be blank")
    private String refreshToken;
} 