package com.agentstore.api.controller;

import com.agentstore.api.dto.AgentDto;
import com.agentstore.api.dto.ApiResponse;
import com.agentstore.api.service.AgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/agents")
@RequiredArgsConstructor
@Tag(name = "Agent Management", description = "Agent Management API")
@SecurityRequirement(name = "Bearer Authentication")
public class AgentController {
    
    private final AgentService agentService;
    
    @GetMapping
    @Operation(summary = "Get all agents (filtered by user's permissions)")
    public ResponseEntity<List<AgentDto>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }
    
    @GetMapping("/paginated")
    @Operation(summary = "Get all agents with pagination (filtered by user's permissions)")
    public ResponseEntity<Page<AgentDto>> getAllAgents(Pageable pageable) {
        return ResponseEntity.ok(agentService.getAllAgents(pageable));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get agent by ID (if user has access)")
    public ResponseEntity<AgentDto> getAgentById(@PathVariable String id) {
        return ResponseEntity.ok(agentService.getAgentById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new agent (Admin only)")
    public ResponseEntity<AgentDto> createAgent(@Valid @RequestBody AgentDto agentDto) {
        return ResponseEntity.ok(agentService.createAgent(agentDto));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an agent (Admin only)")
    public ResponseEntity<AgentDto> updateAgent(@PathVariable String id,
                                                @Valid @RequestBody AgentDto agentDto) {
        return ResponseEntity.ok(agentService.updateAgent(id, agentDto));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an agent (Admin only)")
    public ResponseEntity<ApiResponse<String>> deleteAgent(@PathVariable String id) {
        return ResponseEntity.ok(agentService.deleteAgent(id));
    }
    
    @PostMapping("/users/{userId}/agents/{agentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign agent access to a user (Admin only)")
    public ResponseEntity<ApiResponse<String>> assignAgentToUser(@PathVariable Long userId,
                                                                 @PathVariable String agentId) {
        return ResponseEntity.ok(agentService.assignAgentToUser(userId, agentId));
    }
    
    @DeleteMapping("/users/{userId}/agents/{agentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Revoke agent access from a user (Admin only)")
    public ResponseEntity<ApiResponse<String>> revokeAgentFromUser(@PathVariable Long userId,
                                                                  @PathVariable String agentId) {
        return ResponseEntity.ok(agentService.revokeAgentFromUser(userId, agentId));
    }
} 