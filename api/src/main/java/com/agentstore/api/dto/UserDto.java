package com.agentstore.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDto {
    
    private Long id;
    private String username;
    private String email;
    private boolean enabled;
    private Set<String> roles;
    private List<String> accessibleAgents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 