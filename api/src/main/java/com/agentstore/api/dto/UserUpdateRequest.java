package com.agentstore.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateRequest {
    
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email cannot be more than 100 characters")
    private String email;
    
    @Size(min = 6, max = 40, message = "Password must be between 6 and 40 characters")
    private String password;
    
    private Boolean enabled;
} 